import prisma from '../../prisma/client';
import { AssetStatus } from '../../utils/constants';

export async function getUtilizationReport(organizationId: number, _departmentId?: number) {
  // Find count of assets allocated vs available
  const allocated = await prisma.asset.count({
    where: { organizationId, status: AssetStatus.ALLOCATED },
  });

  const available = await prisma.asset.count({
    where: { organizationId, status: AssetStatus.AVAILABLE },
  });

  const total = allocated + available;
  const utilizationRate = total === 0 ? 0 : (allocated / total) * 100;

  return {
    totalAssets: total,
    allocatedAssets: allocated,
    availableAssets: available,
    utilizationRate: utilizationRate.toFixed(2) + '%',
  };
}

export async function getMaintenanceReport(organizationId: number) {
  const maintenanceAssets = await prisma.asset.count({
    where: { organizationId, status: AssetStatus.UNDER_MAINTENANCE },
  });

  const recentRequests = await prisma.maintenanceRequest.count({
    where: { organizationId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  });

  return {
    assetsCurrentlyUnderMaintenance: maintenanceAssets,
    requestsPast30Days: recentRequests,
  };
}

export async function getIdleAssetsReport(organizationId: number) {
  // Find assets with no activity in 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const idleAssets = await prisma.asset.findMany({
    where: {
      organizationId,
      status: AssetStatus.AVAILABLE,
      lastActivityAt: { lt: thirtyDaysAgo },
    },
    select: {
      id: true,
      name: true,
      tag: true,
      lastActivityAt: true,
    },
  });

  return {
    idleCount: idleAssets.length,
    assets: idleAssets,
  };
}

export async function getFullDashboardReport(organizationId: number, _departmentId?: number) {
  const utilization = await getUtilizationReport(organizationId, _departmentId);
  const maintenance = await getMaintenanceReport(organizationId);
  const idle = await getIdleAssetsReport(organizationId);

  return {
    utilization,
    maintenance,
    idle,
    // AI predictions layer (predictive maintenance, forecasting) goes here in a future step.
  };
}
