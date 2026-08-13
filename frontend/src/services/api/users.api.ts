/**
 * Real users service — talks to the NestJS backend via the shared axios client.
 * Mirrors the mock service function names/signatures.
 */
import { del, get, patch, post } from '@/lib/api';
import type { Paginated, PageParams, User, UserRole } from '@/services/types';

export interface ListUsersParams extends PageParams {
  role?: UserRole;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>;

export async function listUsers(params: ListUsersParams): Promise<Paginated<User>> {
  return get<Paginated<User>>('/users', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      role: params.role,
    },
  });
}

export async function getUser(id: string): Promise<User> {
  return get<User>(`/users/${id}`);
}

export async function createUser(payload: CreateUserInput): Promise<User> {
  return post<User>('/users', payload);
}

export async function updateUser(id: string, payload: UpdateUserInput): Promise<User> {
  return patch<User>(`/users/${id}`, payload);
}

export async function deleteUser(id: string): Promise<void> {
  return del<void>(`/users/${id}`);
}

/** Admin-supplied new password for a user (min 8 chars). */
export async function resetPassword(id: string, password: string): Promise<User> {
  return patch<User>(`/users/${id}/reset-password`, { password });
}

/** Upload a new avatar — dedicated endpoint (NOT part of the PATCH body). */
export async function uploadAvatar(id: string, file: File): Promise<User> {
  const form = new FormData();
  form.append('file', file);
  return post<User>(`/users/${id}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
