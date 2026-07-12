import { apiFetch } from './client';

export interface Allocation {
  id: number;
  assetId: number;
  holderId: number;
  allocatedAt: string;
  isActive: boolean;
}

export async function fetchAllocations(): Promise<Allocation[]> {
  return apiFetch<Allocation[]>('/allocations');
}
