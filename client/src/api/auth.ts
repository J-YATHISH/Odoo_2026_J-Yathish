import { apiFetch } from './client';

// Skeleton definitions matching the backend auth routes
export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // Deferred until Auth build step (returns 501 currently in backend)
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: unknown): Promise<unknown> {
  return apiFetch<unknown>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
