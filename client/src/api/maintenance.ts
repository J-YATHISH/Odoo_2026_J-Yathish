import { apiFetch } from './client';

export interface MaintenanceRequest {
  id: number;
  assetId: number;
  raisedById: number;
  issueDescription: string;
  status: string;
  priority: string;
  issueCategory?: string;
  aiAssessed?: boolean;
  asset?: { name: string; tag: string };
  raisedBy?: { name: string };
  createdAt: string;
}

export async function fetchMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  return apiFetch<MaintenanceRequest[]>('/maintenance');
}

export async function createZeroTouchRequest(issueDescription: string): Promise<MaintenanceRequest> {
  return apiFetch<MaintenanceRequest>('/maintenance/zero-touch', {
    method: 'POST',
    body: JSON.stringify({ issueDescription })
  });
}
