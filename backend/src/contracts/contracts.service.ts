import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractStatus } from '../generated/prisma/enums';
import type {
  ContractModel,
  ContractWhereInput,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

const SORTABLE_COLUMNS = [
  'clientName',
  'status',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
] as const;

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryContractsDto): Promise<Paginated<ContractModel>> {
    const where: ContractWhereInput = {};
    if (query.search) {
      where.clientName = { contains: query.search, mode: 'insensitive' };
    }
    if (query.status) {
      where.status = query.status;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<ContractModel> {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    return contract;
  }

  async create(dto: CreateContractDto): Promise<ContractModel> {
    this.assertDateRange(dto.startDate, dto.endDate);
    return this.prisma.contract.create({
      data: {
        clientName: dto.clientName.trim(),
        type: dto.type.trim(),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? ContractStatus.ACTIVE,
      },
    });
  }

  async update(id: string, dto: UpdateContractDto): Promise<ContractModel> {
    await this.ensureExists(id);

    if (dto.startDate !== undefined && dto.endDate !== undefined) {
      this.assertDateRange(dto.startDate, dto.endDate);
    } else if (dto.startDate !== undefined || dto.endDate !== undefined) {
      const current = await this.findOne(id);
      const start = dto.startDate ?? current.startDate.toISOString();
      const end = dto.endDate ?? current.endDate.toISOString();
      this.assertDateRange(start, end);
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.clientName !== undefined && {
          clientName: dto.clientName.trim(),
        }),
        ...(dto.type !== undefined && { type: dto.type.trim() }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string): Promise<ContractModel> {
    await this.ensureExists(id);
    return this.prisma.contract.update({
      where: { id },
      data: { status: ContractStatus.TERMINATED },
    });
  }

  private assertDateRange(start: string, end: string): void {
    if (new Date(start).getTime() > new Date(end).getTime()) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
  }
}
