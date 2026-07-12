import { apiFetch } from './client';

export interface AuditCycle {
  id: number;
  startDate: string;
  endDate: string;
  closed: boolean;
}

export async function fetchAuditCycles(): Promise<AuditCycle[]> {
  return apiFetch<AuditCycle[]>('/audit');
}
