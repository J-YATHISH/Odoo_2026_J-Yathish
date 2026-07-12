import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, AssetStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';
import { transitionAssetStatus } from '../assets/service';

export async function createAuditCycle(data: z.infer<typeof t.createAuditCycleSchema>) {
  return prisma.$transaction(async (tx) => {
    // 1. Create the cycle
    const cycle = await tx.auditCycle.create({
      data: {
        scopeDept: data.scopeDept,
        scopeLoc: data.scopeLoc,
        startDate: data.startDate,
        endDate: data.endDate,
        auditors: {
          create: data.auditorIds.map(id => ({ employeeId: id }))
        }
      },
    });

    // 2. Find assets in scope (if scopeDept is provided, we can look at assets held by employees in that dept, or just all assets)
    // For this build, let's just grab all available/allocated assets if no scope is provided
    const assets = await tx.asset.findMany({
      where: {
        status: { in: [AssetStatus.AVAILABLE, AssetStatus.ALLOCATED] },
        location: data.scopeLoc ? data.scopeLoc : undefined,
      }
    });

    // 3. Create AuditItems for each asset
    if (assets.length > 0) {
      await tx.auditItem.createMany({
        data: assets.map(a => ({
          auditCycleId: cycle.id,
          assetId: a.id,
        }))
      });
    }

    return cycle;
  });
}

export async function listAuditCycles() {
  return prisma.auditCycle.findMany({
    include: {
      auditors: { include: { employee: { select: { name: true } } } },
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function verifyAuditItem(itemId: number, auditorId: number, data: z.infer<typeof t.updateAuditItemSchema>) {
  const item = await prisma.auditItem.findUnique({
    where: { id: itemId },
    include: { auditCycle: { include: { auditors: true } } }
  });

  if (!item) throw new AppError('Audit item not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (item.auditCycle.closed) throw new AppError('Audit cycle is already closed', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);

  const isAssigned = item.auditCycle.auditors.some(a => a.employeeId === auditorId);
  if (!isAssigned) throw new AppError('You are not assigned to this audit cycle', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);

  return prisma.auditItem.update({
    where: { id: itemId },
    data: {
      verification: data.verification,
      notes: data.notes,
    }
  });
}

export async function closeAuditCycle(cycleId: number) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: { items: true }
  });

  if (!cycle) throw new AppError('Audit cycle not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (cycle.closed) throw new AppError('Audit cycle already closed', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);

  return prisma.$transaction(async (tx) => {
    // 1. Close cycle
    const closedCycle = await tx.auditCycle.update({
      where: { id: cycleId },
      data: { closed: true }
    });

    // 2. Any item marked MISSING gets its asset transitioned to LOST
    for (const item of cycle.items) {
      if (item.verification === 'MISSING') {
        await transitionAssetStatus(item.assetId, AssetStatus.LOST, tx);
      }
    }

    return closedCycle;
  });
}
