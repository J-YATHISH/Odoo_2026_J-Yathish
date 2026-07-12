import { apiFetch } from './client';

export interface DashboardReportResponse {
  utilization: {
    totalAssets: number;
    allocatedAssets: number;
    availableAssets: number;
    utilizationRate: string;
  };
  maintenance: {
    assetsCurrentlyUnderMaintenance: number;
    requestsPast30Days: number;
  };
  idle: {
    idleCount: number;
    assets: Array<{
      id: number;
      name: string;
      tag: string;
      lastActivityAt: string;
    }>;
  };
}

export async function fetchDashboardReport(departmentId?: number): Promise<DashboardReportResponse> {
  const url = departmentId ? `/reports/dashboard?departmentId=${departmentId}` : '/reports/dashboard';
  return apiFetch<DashboardReportResponse>(url);
}
