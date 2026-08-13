/**
 * Minimal auth store — token + user persisted to localStorage.
 * Dependency-free (no zustand); subscribable for React via useSyncExternalStore
 * and readable imperatively for the axios interceptor.
 */
import { useSyncExternalStore } from 'react';

export type AuthRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const STORAGE_KEY = 'mytt-auth';

function load(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed && typeof parsed.token === 'string') return parsed;
    }
  } catch {
    /* corrupted storage — fall through to anonymous */
  }
  return { token: null, user: null };
}

let state: AuthState = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    if (state.token) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getToken(): string | null {
  return state.token;
}

export function getAuth(): AuthState {
  return state;
}

export function setAuth(token: string, user: AuthUser): void {
  state = { token, user };
  persist();
  emit();
}

export function clearAuth(): void {
  state = { token: null, user: null };
  persist();
  emit();
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook — re-renders on login/logout. */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuth);
}
