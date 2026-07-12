import { apiFetch } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  employee: {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number | null;
  };
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  departmentId?: number;
}

export interface SignupResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number | null;
  status: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiFetch<SignupResponse>('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
