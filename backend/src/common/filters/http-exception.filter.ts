import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';
import { Prisma } from '../../generated/prisma/client';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
}

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${body.statusCode} - ${JSON.stringify(body.message)}`,
      );
    }

    response.status(body.statusCode).json({
      statusCode: body.statusCode,
      error: body.error,
      message: body.message,
      timestamp: new Date().toISOString(),
    });
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { statusCode: status, error: exception.name, message: response };
      }
      const partial = response as Partial<ErrorBody>;
      return {
        statusCode: status,
        error: partial.error ?? STATUS_TEXT[status] ?? exception.name,
        message: partial.message ?? exception.message,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            statusCode: HttpStatus.CONFLICT,
            error: 'Conflict',
            message: 'A record with this unique value already exists.',
          };
        case 'P2003':
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'Referenced record does not exist.',
          };
        case 'P2025':
          return {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: 'Record not found.',
          };
        default:
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'Database constraint violation.',
          };
      }
    }

    if (exception instanceof MulterError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: `File upload failed: ${exception.message}`,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error.',
    };
  }
}
