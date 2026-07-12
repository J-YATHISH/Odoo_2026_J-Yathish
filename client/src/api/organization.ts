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
  role: string;
  departmentId?: number;
  status: string;
}

export async function fetchDepartments(): Promise<Department[]> {
  return apiFetch<Department[]>('/organization/departments');
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>('/organization/employees');
}
