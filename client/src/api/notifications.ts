import { apiFetch } from './client';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications');
}
