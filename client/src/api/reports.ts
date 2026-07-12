import { apiFetch } from './client';

export async function fetchReportsSummary(): Promise<unknown> {
  return apiFetch<unknown>('/reports/summary');
}
