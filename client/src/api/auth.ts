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
    organizationId: number;
  };
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  joinCode?: string;
  organizationName?: string;
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

export interface CreateOrgPayload {
  orgName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface CreateOrgResponse {
  token: string;
  joinCode: string;
  employee: {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number | null;
    organizationId: number;
  };
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

export async function createOrganization(payload: CreateOrgPayload): Promise<CreateOrgResponse> {
  return apiFetch<CreateOrgResponse>('/organizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
