import { apiFetch } from './client';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: number;
  employeeId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  createdAt: string;
  employee: {
    name: string;
  };
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications');
}

export async function fetchActivityLogs(limit: number = 20): Promise<ActivityLogItem[]> {
  return apiFetch<ActivityLogItem[]>(`/notifications/activity?limit=${limit}`);
}
