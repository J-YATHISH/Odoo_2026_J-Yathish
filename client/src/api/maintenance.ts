import { apiFetch } from './client';

export interface MaintenanceRequest {
  id: number;
  assetId: number;
  raisedById: number;
  issueDescription: string;
  status: string;
}

export async function fetchMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  return apiFetch<MaintenanceRequest[]>('/maintenance');
}
