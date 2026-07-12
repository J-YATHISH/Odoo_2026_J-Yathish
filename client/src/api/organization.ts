import { apiFetch } from './client';

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  status: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string | { id: number; name: string };
  department?: { id: number; name: string };
  departmentId?: number;
  status: string;
}

export interface OrganizationInfo {
  id: number;
  name: string;
  joinCode: string;
}

export async function fetchDepartments(): Promise<Department[]> {
  return apiFetch<Department[]>('/organization/departments');
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>('/organization/employees');
}

export async function fetchOrganizationInfo(): Promise<OrganizationInfo> {
  return apiFetch<OrganizationInfo>('/organization/info');
}
