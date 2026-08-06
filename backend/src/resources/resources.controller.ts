import {
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/enums';
import type { ResourceModel } from '../generated/prisma/models';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateResourceDto } from './dto/create-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import {
  PaginatedResourcesResponseDto,
  ResourceResponseDto,
} from './dto/resource-response.dto';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({
    summary: 'List resources with pagination, search and filters (ADMIN)',
  })
  @ApiOkResponse({ type: PaginatedResourcesResponseDto })
  findAll(
    @Query() query: QueryResourcesDto,
  ): Promise<Paginated<ResourceModel>> {
    return this.resourcesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one resource (ADMIN)' })
  @ApiOkResponse({ type: ResourceResponseDto })
  findOne(@Param('id') id: string): Promise<ResourceModel> {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a resource (ADMIN)' })
  @ApiCreatedResponse({ type: ResourceResponseDto })
  create(@Body() dto: CreateResourceDto): Promise<ResourceModel> {
    return this.resourcesService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a resource (ADMIN)' })
  @ApiOkResponse({ type: ResourceResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<ResourceModel> {
    return this.resourcesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a resource -> status BLOCKED (ADMIN)' })
  @ApiOkResponse({ type: ResourceResponseDto })
  remove(@Param('id') id: string): Promise<ResourceModel> {
    return this.resourcesService.remove(id);
  }
}
