import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  IMAGE_MAX_SIZE,
  imageDiskStorage,
  imageFileFilter,
  uploadsDir,
} from '../common/utils/upload.util';
import { SafeUser } from '../auth/dto/auth-response.dto';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List users with pagination, search and role filter (ADMIN)',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  findAll(@Query() query: QueryUsersDto): Promise<Paginated<SafeUser>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one user (ADMIN)' })
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id') id: string): Promise<SafeUser> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user (ADMIN)' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() dto: CreateUserDto): Promise<SafeUser> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user (ADMIN)' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a user password (ADMIN)' })
  @ApiOkResponse({ type: UserResponseDto })
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: { user: AuthenticatedUser },
  ): Promise<SafeUser> {
    return this.usersService.resetPassword(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (ADMIN)' })
  @ApiNoContentResponse({ description: 'User deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageDiskStorage('avatar'),
      limits: { fileSize: IMAGE_MAX_SIZE },
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Upload an avatar image for a user (ADMIN)' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<SafeUser> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const previous = await this.usersService.findOne(id);
    const updated = await this.usersService.updateAvatar(
      id,
      `/uploads/${file.filename}`,
    );

    if (previous.avatarUrl?.startsWith('/uploads/')) {
      const oldFilePath = join(uploadsDir(), basename(previous.avatarUrl));
      await unlink(oldFilePath).catch(() => undefined);
    }

    return updated;
  }
}
