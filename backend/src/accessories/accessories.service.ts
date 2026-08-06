import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AccessoryModel,
  AccessoryWhereInput,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { QueryAccessoriesDto } from './dto/query-accessories.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';

const SORTABLE_COLUMNS = [
  'name',
  'category',
  'price',
  'stockQuantity',
  'createdAt',
  'updatedAt',
] as const;

@Injectable()
export class AccessoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryAccessoriesDto,
  ): Promise<Paginated<AccessoryModel>> {
    const where: AccessoryWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.category) {
      where.category = query.category;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.accessory.count({ where }),
      this.prisma.accessory.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<AccessoryModel> {
    const accessory = await this.prisma.accessory.findUnique({ where: { id } });
    if (!accessory) {
      throw new NotFoundException(`Accessory ${id} not found`);
    }
    return accessory;
  }

  async create(dto: CreateAccessoryDto): Promise<AccessoryModel> {
    return this.prisma.accessory.create({
      data: {
        name: dto.name.trim(),
        category: dto.category,
        price: dto.price,
        stockQuantity: dto.stockQuantity,
      },
    });
  }

  async update(id: string, dto: UpdateAccessoryDto): Promise<AccessoryModel> {
    await this.ensureExists(id);

    return this.prisma.accessory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stockQuantity !== undefined && {
          stockQuantity: dto.stockQuantity,
        }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.accessory.delete({ where: { id } });
  }

  async updateImage(id: string, imageUrl: string): Promise<AccessoryModel> {
    await this.ensureExists(id);
    return this.prisma.accessory.update({
      where: { id },
      data: { imageUrl },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const accessory = await this.prisma.accessory.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!accessory) {
      throw new NotFoundException(`Accessory ${id} not found`);
    }
  }
}
