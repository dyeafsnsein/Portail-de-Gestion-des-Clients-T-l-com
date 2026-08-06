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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/enums';
import type { ServiceModel } from '../generated/prisma/models';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginated } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  PaginatedServicesResponseDto,
  ServiceResponseDto,
} from './dto/service-response.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List services with pagination, search and filters (ADMIN)',
  })
  @ApiOkResponse({ type: PaginatedServicesResponseDto })
  findAll(@Query() query: QueryServicesDto): Promise<Paginated<ServiceModel>> {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one service (ADMIN)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  findOne(@Param('id') id: string): Promise<ServiceModel> {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service (ADMIN)' })
  @ApiCreatedResponse({ type: ServiceResponseDto })
  create(@Body() dto: CreateServiceDto): Promise<ServiceModel> {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a service (ADMIN)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceModel> {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service (ADMIN)' })
  @ApiNoContentResponse({ description: 'Service deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.servicesService.remove(id);
  }
}
