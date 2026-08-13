/**
 * Real orders service — talks to the NestJS backend via axios.
 */
import { get, patch } from '@/lib/api';
import type { Order, OrderStatus, PageParams, Paginated } from '@/services/types';

export interface ListOrdersParams extends PageParams {
  status?: OrderStatus;
}

export async function listOrders(
  params: ListOrdersParams,
): Promise<Paginated<Order>> {
  return get<Paginated<Order>>('/orders', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
    },
  });
}

export async function listRecentOrders(limit = 5): Promise<Order[]> {
  return get<Order[]>('/orders/recent', {
    params: { limit },
  });
}

export async function getOrder(id: string): Promise<Order> {
  return get<Order>(`/orders/${id}`);
}

/** Sets the order status (advance / cancel). */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return patch<Order>(`/orders/${id}/status`, { status });
}
