/**
 * Real contracts service — talks to the NestJS backend via the shared axios client.
 * Mirrors the mock service function names/signatures but returns the backend
 * envelope ({ items, meta }) instead of the mock { data, total }.
 */
import { del, get, patch, post } from '@/lib/api';
import type { Contract, ContractStatus, PageParams, Paginated } from '@/services/types';

export interface ListContractsParams extends PageParams {
  status?: ContractStatus;
  type?: string;
}

export interface CreateContractInput {
  clientId: string;
  type: string;
  status?: ContractStatus;
  startDate: string;
  endDate: string;
}

export type UpdateContractInput = Partial<Omit<CreateContractInput, 'clientId'>>;

export async function listContracts(
  params: ListContractsParams,
): Promise<Paginated<Contract>> {
  return get<Paginated<Contract>>('/contracts', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
      type: params.type,
    },
  });
}

/** All contracts (no paging) — used by pickers and the dashboard. */
export async function listAllContracts(): Promise<Contract[]> {
  const res = await get<Paginated<Contract>>('/contracts', {
    params: { page: 1, pageSize: 100 },
  });
  return res.items;
}

export async function getContract(id: string): Promise<Contract> {
  return get<Contract>(`/contracts/${id}`);
}

export async function createContract(payload: CreateContractInput): Promise<Contract> {
  return post<Contract>('/contracts', payload);
}

export async function updateContract(id: string, payload: UpdateContractInput): Promise<Contract> {
  return patch<Contract>(`/contracts/${id}`, payload);
}

/** Soft action — marks the contract TERMINATED (no hard delete). */
export async function terminateContract(id: string): Promise<Contract> {
  return del<Contract>(`/contracts/${id}`);
}
