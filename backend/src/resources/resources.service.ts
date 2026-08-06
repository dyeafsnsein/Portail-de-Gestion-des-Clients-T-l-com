import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceStatus } from '../generated/prisma/enums';
import type {
  ResourceModel,
  ResourceWhereInput,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

const SORTABLE_COLUMNS = [
  'type',
  'iccid',
  'imsi',
  'msisdn',
  'status',
  'contractId',
  'createdAt',
  'updatedAt',
] as const;

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryResourcesDto): Promise<Paginated<ResourceModel>> {
    const where: ResourceWhereInput = {};
    if (query.search) {
      where.OR = [
        { iccid: { contains: query.search, mode: 'insensitive' } },
        { imsi: { contains: query.search, mode: 'insensitive' } },
        { msisdn: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.contractId) {
      where.contractId = query.contractId;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<ResourceModel> {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return resource;
  }

  async create(dto: CreateResourceDto): Promise<ResourceModel> {
    return this.prisma.resource.create({
      data: {
        type: dto.type,
        iccid: dto.iccid.trim(),
        imsi: dto.imsi.trim(),
        msisdn: dto.msisdn.trim(),
        status: dto.status ?? ResourceStatus.AVAILABLE,
        contractId: dto.contractId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateResourceDto): Promise<ResourceModel> {
    await this.ensureExists(id);

    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.iccid !== undefined && { iccid: dto.iccid.trim() }),
        ...(dto.imsi !== undefined && { imsi: dto.imsi.trim() }),
        ...(dto.msisdn !== undefined && { msisdn: dto.msisdn.trim() }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.contractId !== undefined && { contractId: dto.contractId }),
      },
    });
  }

  async remove(id: string): Promise<ResourceModel> {
    await this.ensureExists(id);
    return this.prisma.resource.update({
      where: { id },
      data: { status: ResourceStatus.BLOCKED },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!resource) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
  }
}
