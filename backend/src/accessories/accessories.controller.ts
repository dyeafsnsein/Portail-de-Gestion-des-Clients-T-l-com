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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Role } from '../generated/prisma/enums';
import type { AccessoryModel } from '../generated/prisma/models';
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
import { AccessoriesService } from './accessories.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { QueryAccessoriesDto } from './dto/query-accessories.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';

@ApiTags('accessories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('accessories')
export class AccessoriesController {
  constructor(private readonly accessoriesService: AccessoriesService) {}

  @Get()
  @ApiOperation({
    summary:
      'List accessories with pagination, search and category filter (ADMIN)',
  })
  findAll(
    @Query() query: QueryAccessoriesDto,
  ): Promise<Paginated<AccessoryModel>> {
    return this.accessoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one accessory (ADMIN)' })
  findOne(@Param('id') id: string): Promise<AccessoryModel> {
    return this.accessoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an accessory (ADMIN)' })
  create(@Body() dto: CreateAccessoryDto): Promise<AccessoryModel> {
    return this.accessoriesService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an accessory (ADMIN)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccessoryDto,
  ): Promise<AccessoryModel> {
    return this.accessoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an accessory (ADMIN)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.accessoriesService.remove(id);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageDiskStorage('accessory'),
      limits: { fileSize: IMAGE_MAX_SIZE },
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Upload an image for an accessory (ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<AccessoryModel> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const previous = await this.accessoriesService.findOne(id);
    const updated = await this.accessoriesService.updateImage(
      id,
      `/uploads/${file.filename}`,
    );

    if (previous.imageUrl?.startsWith('/uploads/')) {
      const oldFilePath = join(uploadsDir(), basename(previous.imageUrl));
      await unlink(oldFilePath).catch(() => undefined);
    }

    return updated;
  }
}
