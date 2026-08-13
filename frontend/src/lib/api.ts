/**
 * Shared Axios client — single entry point for all backend calls.
 *
 * - baseURL `/api` → Vite dev proxy forwards to http://127.0.0.1:3000 (backend).
 * - Request interceptor attaches the Bearer JWT from the auth store.
 * - Response interceptor normalizes the backend's uniform error body
 *   `{statusCode, error, message, timestamp}`:
 *     - 401 → clear session + redirect to /login (except on the login attempt itself)
 *     - 403 → toast "Not authorized"
 *     - other → toast the backend `message` (string or array)
 */
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { clearAuth, getToken } from '@/lib/auth';

export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiErrorBody {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  timestamp?: string;
}

function messageText(body: ApiErrorBody | undefined): string | null {
  if (!body) return null;
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (typeof body.message === 'string' && body.message.length > 0) return body.message;
  if (typeof body.error === 'string' && body.error.length > 0) return body.error;
  return null;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const body = error.response?.data;
    const url = error.config?.url ?? '';

    // 401 on the login call itself = invalid credentials → toast, no redirect.
    const isLoginCall = url.includes('/auth/login');

    if (status === 401 && !isLoginCall) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    } else if (status === 403) {
      toast.error('Not authorized');
    } else {
      const msg = messageText(body);
      if (msg) toast.error(msg);
    }

    return Promise.reject(error);
  },
);

/** Typed GET that returns the JSON payload. */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

/** Typed POST. */
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

/** Typed PATCH. */
export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.patch<T>(url, data, config);
  return res.data;
}

/** Typed DELETE — resolves the status code (204 included). */
export async function del<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}
