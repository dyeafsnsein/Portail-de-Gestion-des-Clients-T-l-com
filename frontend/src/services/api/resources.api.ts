/**
 * Real resources (SIM/eSIM) service — talks to the NestJS backend via axios.
 */
import { del, get, patch, post } from '@/lib/api';
import type { PageParams, Paginated, Resource, ResourceStatus, ResourceType } from '@/services/types';

export interface ListResourcesParams extends PageParams {
  type?: ResourceType;
  status?: ResourceStatus;
}

export interface CreateResourceInput {
  type: ResourceType;
  iccid: string;
  imsi: string;
  msisdn: string;
  status: ResourceStatus;
  contractId: string | null;
}

export type UpdateResourceInput = Partial<CreateResourceInput>;

export async function listResources(
  params: ListResourcesParams,
): Promise<Paginated<Resource>> {
  return get<Paginated<Resource>>('/resources', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      type: params.type,
      status: params.status,
    },
  });
}

export async function getResource(id: string): Promise<Resource> {
  return get<Resource>(`/resources/${id}`);
}

export async function createResource(payload: CreateResourceInput): Promise<Resource> {
  return post<Resource>('/resources', payload);
}

export async function updateResource(id: string, payload: UpdateResourceInput): Promise<Resource> {
  return patch<Resource>(`/resources/${id}`, payload);
}

/** Soft action — marks the resource BLOCKED (no hard delete). */
export async function blockResource(id: string): Promise<Resource> {
  return del<Resource>(`/resources/${id}`);
}
