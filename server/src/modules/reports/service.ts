import prisma from '../../prisma/client';
import { AssetStatus } from '../../utils/constants';

export async function getUtilizationReport(organizationId: number, departmentId?: number) {
  // Find count of assets allocated vs available
  const allocated = await prisma.asset.count({
    where: {
      organizationId,
      status: AssetStatus.ALLOCATED,
      ...(departmentId ? {
        allocations: {
          some: {
            isActive: true,
            holder: { departmentId }
          }
        }
      } : {})
    }
  });

  const available = await prisma.asset.count({
    where: {
      organizationId,
      status: AssetStatus.AVAILABLE,
      ...(departmentId ? {
        allocations: {
          some: {
            holder: { departmentId }
          }
        }
      } : {})
    }
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

export async function getMaintenanceReport(organizationId: number, departmentId?: number) {
  const maintenanceAssets = await prisma.asset.count({
    where: {
      organizationId,
      status: AssetStatus.UNDER_MAINTENANCE,
      ...(departmentId ? {
        allocations: {
          some: {
            holder: { departmentId }
          }
        }
      } : {})
    }
  });

  const recentRequests = await prisma.maintenanceRequest.count({
    where: {
      organizationId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      ...(departmentId ? {
        raisedBy: { departmentId }
      } : {})
    }
  });

  return {
    assetsCurrentlyUnderMaintenance: maintenanceAssets,
    requestsPast30Days: recentRequests,
  };
}

export async function getIdleAssetsReport(organizationId: number, departmentId?: number) {
  // Find assets with no activity in 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const idleAssets = await prisma.asset.findMany({
    where: {
      organizationId,
      status: AssetStatus.AVAILABLE,
      lastActivityAt: { lt: thirtyDaysAgo },
      ...(departmentId ? {
        allocations: {
          some: {
            holder: { departmentId }
          }
        }
      } : {})
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

export async function getFullDashboardReport(organizationId: number, departmentId?: number) {
  const utilization = await getUtilizationReport(organizationId, departmentId);
  const maintenance = await getMaintenanceReport(organizationId, departmentId);
  const idle = await getIdleAssetsReport(organizationId, departmentId);

  const activeBookings = await prisma.booking.count({
    where: {
      organizationId,
      status: { in: ['UPCOMING', 'ONGOING'] },
      ...(departmentId ? { bookedBy: { departmentId } } : {})
    }
  });

  const pendingTransfers = await prisma.transferRequest.count({
    where: {
      organizationId,
      status: 'REQUESTED',
      ...(departmentId ? {
        OR: [
          { from: { departmentId } },
          { to: { departmentId } }
        ]
      } : {})
    }
  });

  const upcomingReturns = await prisma.allocation.count({
    where: {
      organizationId,
      isActive: true,
      expectedReturnDate: { not: null },
      ...(departmentId ? { holder: { departmentId } } : {})
    }
  });

  const overdueAllocations = await prisma.allocation.findMany({
    where: {
      organizationId,
      isActive: true,
      expectedReturnDate: { lt: new Date() },
      ...(departmentId ? { holder: { departmentId } } : {})
    },
    include: {
      asset: { select: { id: true, name: true, tag: true } },
      holder: { select: { name: true, department: { select: { name: true } } } }
    },
    orderBy: { expectedReturnDate: 'asc' },
    take: 10,
  });

  const overdueItems = overdueAllocations.map(alloc => {
    const daysOverdue = Math.max(1, Math.floor((Date.now() - new Date(alloc.expectedReturnDate!).getTime()) / (1000 * 60 * 60 * 24)));
    return {
      id: alloc.asset.tag,
      status: `OVERDUE ${daysOverdue}D`,
      name: alloc.asset.name,
      sub: `Return Pending - ${alloc.holder.name} (${alloc.holder.department?.name || 'No Dept'})`,
      color: 'bg-[#C25D4E]',
      textColor: 'text-[#C25D4E]',
    };
  });

  return {
    utilization,
    maintenance,
    idle,
    activeBookingsCount: activeBookings,
    pendingTransfersCount: pendingTransfers,
    upcomingReturnsCount: upcomingReturns,
    overdueItems,
  };
}
