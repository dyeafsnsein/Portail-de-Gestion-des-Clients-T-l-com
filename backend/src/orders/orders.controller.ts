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
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { RecentOrdersQueryDto } from './dto/recent-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary:
      'List orders with pagination, search (client) and status filter (ADMIN)',
  })
  @ApiOkResponse({ type: PaginatedOrdersResponseDto })
  findAll(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get the most recent orders (ADMIN)' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  findRecent(@Query() query: RecentOrdersQueryDto) {
    return this.ordersService.findRecent(query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order with its items (ADMIN)' })
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create an order with items (ADMIN). totalAmount is computed server-side',
  })
  @ApiCreatedResponse({ type: OrderResponseDto })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an order status (ADMIN)' })
  @ApiOkResponse({ type: OrderResponseDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete an order -> status CANCELLED (ADMIN)',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
