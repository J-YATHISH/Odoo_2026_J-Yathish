import { apiFetch } from './client';

export interface Asset {
  id: number;
  tag: string;
  name: string;
  categoryId: number;
  status: string;
}

export async function fetchAssets(): Promise<Asset[]> {
  return apiFetch<Asset[]>('/assets');
}
