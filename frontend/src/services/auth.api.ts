import { post } from '@/lib/api';
import { setAuth, type AuthUser } from '@/lib/auth';

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/auth/login', { email, password });
  setAuth(res.accessToken, res.user);
  return res;
}
