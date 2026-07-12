import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, AssetStatus, MaintenanceStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';
import { transitionAssetStatus } from '../assets/service';

export async function createMaintenanceRequest(employeeId: number, data: z.infer<typeof t.createMaintenanceSchema>) {
  // Keyword scanner for auto-priority
  const highPriorityKeywords = ['urgent', 'broken', 'shattered', 'smoke', 'fire', 'leak', 'critical'];
  const descLower = data.issueDescription.toLowerCase();
  
  let priority = 'Medium';
  if (highPriorityKeywords.some(kw => descLower.includes(kw))) {
    priority = 'High';
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        assetId: data.assetId,
        raisedById: employeeId,
        issueDescription: data.issueDescription,
        photoUrl: data.photoUrl,
        priority,
        status: MaintenanceStatus.PENDING,
      },
    });

    await tx.activityLog.create({
      data: {
        employeeId,
        action: 'RAISED_MAINTENANCE',
        entityType: 'Asset',
        entityId: data.assetId,
      }
    });

    return request;
  });
}

export async function listMaintenanceRequests() {
  return prisma.maintenanceRequest.findMany({
    include: {
      asset: { select: { name: true, tag: true } },
      raisedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateMaintenanceRequest(id: number, data: z.infer<typeof t.updateMaintenanceSchema>) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new AppError('Maintenance request not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: data.status,
        technicianName: data.technicianName,
        priority: data.priority,
        resolvedAt: data.status === MaintenanceStatus.RESOLVED ? new Date() : undefined,
      },
    });

    // Enforce asset state machine based on maintenance status
    if (data.status === MaintenanceStatus.IN_PROGRESS || data.status === MaintenanceStatus.APPROVED) {
      await transitionAssetStatus(request.assetId, AssetStatus.UNDER_MAINTENANCE, tx);
    } else if (data.status === MaintenanceStatus.RESOLVED) {
      await transitionAssetStatus(request.assetId, AssetStatus.AVAILABLE, tx);
    }

    return updated;
  });
}
