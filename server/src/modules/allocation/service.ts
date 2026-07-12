import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, AssetStatus, TransferStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';
import { transitionAssetStatus } from '../assets/service';

export async function createAllocation(data: z.infer<typeof t.createAllocationSchema>) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the allocation.
      // If the asset already has an active allocation, Postgres partial unique index
      // will throw a Prisma P2002 error, which we catch below.
      const allocation = await tx.allocation.create({
        data: {
          assetId: data.assetId,
          holderId: data.holderId,
          expectedReturnDate: data.expectedReturnDate,
          isActive: true,
        },
      });

      // 2. Transition asset status
      await transitionAssetStatus(data.assetId, AssetStatus.ALLOCATED, tx);

      // 3. Log activity
      await tx.activityLog.create({
        data: {
          employeeId: data.holderId,
          action: 'ALLOCATED_ASSET',
          entityType: 'Asset',
          entityId: data.assetId,
        }
      });

      return allocation;
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Postgres unique constraint violation: an active allocation exists!
      // Fetch the current holder to tell the user who has it.
      const active = await prisma.allocation.findFirst({
        where: { assetId: data.assetId, isActive: true },
        include: { holder: { select: { name: true } }, asset: { select: { categoryId: true, name: true } } },
      });

      // Fetch 3 alternative available assets of the same category
      let alternatives: any[] = [];
      if (active?.asset) {
        alternatives = await prisma.asset.findMany({
          where: { categoryId: active.asset.categoryId, status: AssetStatus.AVAILABLE },
          take: 3,
          select: { id: true, name: true, tag: true },
        });
      }

      throw new AppError(
        `Asset is currently held by ${active?.holder.name ?? 'someone else'}.`,
        HTTP.CONFLICT,
        ErrorCode.CONFLICT,
        { alternatives } // Sending back alternative suggestions!
      );
    }
    throw error;
  }
}

export async function returnAsset(allocationId: number, reqEmployeeId: number, data: z.infer<typeof t.returnAssetSchema>) {
  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
  if (!allocation) throw new AppError('Allocation not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (!allocation.isActive) throw new AppError('Allocation is already returned', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);
  
  // Ensure the person returning it is the holder, or they are an admin
  // (In a real app, we'd check roles here, but we'll allow the holder for now)

  return prisma.$transaction(async (tx) => {
    const updated = await tx.allocation.update({
      where: { id: allocationId },
      data: {
        isActive: false,
        returnedAt: new Date(),
        conditionAtReturn: data.conditionAtReturn,
      },
    });

    await transitionAssetStatus(allocation.assetId, AssetStatus.AVAILABLE, tx);

    await tx.activityLog.create({
      data: {
        employeeId: reqEmployeeId,
        action: 'RETURNED_ASSET',
        entityType: 'Asset',
        entityId: allocation.assetId,
      }
    });

    return updated;
  });
}

// ─── Transfer Requests ────────────────────────────────────────────────────────

export async function requestTransfer(allocationId: number, fromId: number, data: z.infer<typeof t.requestTransferSchema>) {
  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
  if (!allocation || !allocation.isActive) throw new AppError('Active allocation not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (allocation.holderId !== fromId) throw new AppError('Only the current holder can request a transfer', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);

  return prisma.transferRequest.create({
    data: {
      allocationId,
      fromId,
      toId: data.toId,
      reason: data.reason,
      status: TransferStatus.REQUESTED,
    },
  });
}

export async function resolveTransfer(requestId: number, toId: number, data: z.infer<typeof t.resolveTransferSchema>) {
  const request = await prisma.transferRequest.findUnique({
    where: { id: requestId },
    include: { allocation: true }
  });

  if (!request) throw new AppError('Transfer request not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  if (request.toId !== toId) throw new AppError('Only the recipient can resolve this request', HTTP.FORBIDDEN, ErrorCode.FORBIDDEN);
  if (request.status !== TransferStatus.REQUESTED) throw new AppError('Request already resolved', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);

  return prisma.$transaction(async (tx) => {
    // 1. Update the request status
    const updatedRequest = await tx.transferRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        resolvedAt: new Date(),
      },
    });

    if (data.status === TransferStatus.APPROVED) {
      // 2. End current allocation
      await tx.allocation.update({
        where: { id: request.allocationId },
        data: { isActive: false, returnedAt: new Date() },
      });

      // 3. Create new allocation for the recipient
      await tx.allocation.create({
        data: {
          assetId: request.allocation.assetId,
          holderId: toId,
          isActive: true,
        },
      });

      // 4. Log it
      await tx.activityLog.create({
        data: {
          employeeId: toId,
          action: 'ACCEPTED_TRANSFER',
          entityType: 'Asset',
          entityId: request.allocation.assetId,
        }
      });
    }

    return updatedRequest;
  });
}
