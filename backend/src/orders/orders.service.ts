import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../generated/prisma/enums';
import type {
  OrderModel,
  OrderWhereInput,
  UserSelect,
} from '../generated/prisma/models';
import {
  Paginated,
  paginate,
  paginationSkip,
  parseSort,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const CLIENT_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} satisfies UserSelect;

type ClientSummary = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

type OrderWithRelations = OrderModel & {
  client: ClientSummary;
  items: OrderItemWithOrderId[];
};

type OrderItemWithOrderId = {
  id: string;
  orderId: string;
  itemType: string;
  itemName: string;
  quantity: number;
  priceAtPurchase: number;
  createdAt: Date;
};

const ORDER_INCLUDE = {
  client: { select: CLIENT_SELECT },
  items: { orderBy: { createdAt: 'asc' as const } },
} as const;

const SORTABLE_COLUMNS = [
  'status',
  'totalAmount',
  'createdAt',
  'updatedAt',
] as const;

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryOrdersDto): Promise<Paginated<OrderWithRelations>> {
    const where: OrderWhereInput = {};
    if (query.search) {
      where.OR = [
        { clientId: { contains: query.search, mode: 'insensitive' } },
        { client: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          client: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          client: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip: paginationSkip(query),
        take: query.pageSize,
        orderBy: parseSort(query, SORTABLE_COLUMNS),
        include: ORDER_INCLUDE,
      }),
    ]);

    return paginate(items, totalItems, query);
  }

  async findOne(id: string): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async findRecent(limit: number): Promise<OrderWithRelations[]> {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: ORDER_INCLUDE,
    });
  }

  async create(dto: CreateOrderDto): Promise<OrderWithRelations> {
    const totalAmount = roundAmount(
      dto.items.reduce(
        (sum, item) => sum + item.quantity * item.priceAtPurchase,
        0,
      ),
    );

    return this.prisma.order.create({
      data: {
        clientId: dto.clientId,
        status: OrderStatus.PENDING,
        totalAmount,
        items: {
          create: dto.items.map((item) => ({
            itemType: item.itemType,
            itemName: item.itemName.trim(),
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderWithRelations> {
    await this.ensureExists(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: ORDER_INCLUDE,
    });
  }

  async remove(id: string): Promise<OrderWithRelations> {
    await this.ensureExists(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: ORDER_INCLUDE,
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
  }
}
