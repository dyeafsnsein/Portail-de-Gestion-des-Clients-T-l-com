/**
 * Real accessories service — talks to the NestJS backend via axios.
 * Note: imageUrl is NOT part of the create/update payload — images are set
 * server-side via the dedicated POST /accessories/:id/image endpoint.
 */
import { get, patch, post } from '@/lib/api';
import type { Accessory, AccessoryCategory, PageParams, Paginated } from '@/services/types';

export interface ListAccessoriesParams extends PageParams {
  category?: AccessoryCategory;
}

export interface CreateAccessoryInput {
  name: string;
  category: AccessoryCategory;
  price: number;
  stockQuantity: number;
}

export type UpdateAccessoryInput = Partial<CreateAccessoryInput>;

export async function listAccessories(
  params: ListAccessoriesParams,
): Promise<Paginated<Accessory>> {
  return get<Paginated<Accessory>>('/accessories', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      category: params.category,
    },
  });
}

export async function getAccessory(id: string): Promise<Accessory> {
  return get<Accessory>(`/accessories/${id}`);
}

export async function createAccessory(payload: CreateAccessoryInput): Promise<Accessory> {
  return post<Accessory>('/accessories', payload);
}

export async function updateAccessory(id: string, payload: UpdateAccessoryInput): Promise<Accessory> {
  return patch<Accessory>(`/accessories/${id}`, payload);
}

/** Upload an image for an existing accessory — dedicated multipart endpoint. */
export async function uploadImage(id: string, file: File): Promise<Accessory> {
  const form = new FormData();
  form.append('file', file);
  return post<Accessory>(`/accessories/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
