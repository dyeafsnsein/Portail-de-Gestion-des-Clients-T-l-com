import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ServiceModel,
  ServiceWhereInput,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

const SORTABLE_COLUMNS = [
  'name',
  'type',
  'price',
  'isActive',
  'createdAt',
  'updatedAt',
] as const;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryServicesDto): Promise<Paginated<ServiceModel>> {
    const where: ServiceWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<ServiceModel> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    return service;
  }

  async create(dto: CreateServiceDto): Promise<ServiceModel> {
    return this.prisma.service.create({
      data: {
        name: dto.name.trim(),
        type: dto.type,
        description: dto.description.trim(),
        price: dto.price,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceModel> {
    await this.ensureExists(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.service.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
  }
}
