/**
 * Real services catalog service — talks to the NestJS backend via axios.
 */
import { get, patch, post } from '@/lib/api';
import type { PageParams, Paginated, Service, ServiceType } from '@/services/types';

export interface ListServicesParams extends PageParams {
  type?: ServiceType;
  isActive?: boolean;
}

export interface CreateServiceInput {
  name: string;
  type: ServiceType;
  description: string;
  price: number;
  isActive: boolean;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export async function listServices(
  params: ListServicesParams,
): Promise<Paginated<Service>> {
  return get<Paginated<Service>>('/services', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      type: params.type,
      isActive: params.isActive,
    },
  });
}

export async function getService(id: string): Promise<Service> {
  return get<Service>(`/services/${id}`);
}

export async function createService(payload: CreateServiceInput): Promise<Service> {
  return post<Service>('/services', payload);
}

export async function updateService(id: string, payload: UpdateServiceInput): Promise<Service> {
  return patch<Service>(`/services/${id}`, payload);
}
