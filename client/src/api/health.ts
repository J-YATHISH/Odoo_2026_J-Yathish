import { apiFetch } from './client';

export interface HealthResponse {
  status: string;
  db: string;
  timestamp: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}
