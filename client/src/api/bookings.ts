import { apiFetch } from './client';

export interface Booking {
  id: number;
  assetId: number;
  bookedById: number;
  startTime: string;
  endTime: string;
  status: string;
}

export async function fetchBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>('/bookings');
}
