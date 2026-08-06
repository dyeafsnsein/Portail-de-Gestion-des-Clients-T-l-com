import { LogLevel, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const LOG_LEVEL_ORDER: LogLevel[] = [
  'error',
  'warn',
  'log',
  'verbose',
  'debug',
];

function resolveLogLevels(configured: string): LogLevel[] {
  const index = LOG_LEVEL_ORDER.indexOf(configured as LogLevel);
  return index === -1 ? LOG_LEVEL_ORDER.slice(2) : LOG_LEVEL_ORDER.slice(index);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(resolveLogLevels(process.env.LOG_LEVEL ?? 'log'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const uploadsDir = join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads');
  mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Telecom Customer Management API')
    .setDescription(
      'Admin-side backend API. All endpoints except auth require a bearer token with role ADMIN.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Public authentication (register, login)')
    .addTag(
      'users',
      'Admin user management (CRUD, avatar upload, password reset)',
    )
    .addTag('contracts', 'Admin contract management (CRUD, soft delete)')
    .addTag('resources', 'Admin resource management (CRUD, soft delete)')
    .addTag('services', 'Admin service management (CRUD)')
    .addTag('accessories', 'Admin accessory management (CRUD, image upload)')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger docs on http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
