import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, AssetStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';

export async function createAsset(data: z.infer<typeof t.createAssetSchema>) {
  // Use a transaction to ensure tag generation is safe and sequential
  return prisma.$transaction(async (tx) => {
    const count = await tx.asset.count();
    const tag = `AF-${String(count + 1).padStart(4, '0')}`;

    return tx.asset.create({
      data: {
        ...data,
        tag,
      },
      include: { category: { select: { name: true } } },
    });
  });
}

export async function listAssets(query: z.infer<typeof t.searchAssetsSchema>) {
  const where: any = {};

  if (query.query) {
    where.OR = [
      { tag: { contains: query.query, mode: 'insensitive' } },
      { name: { contains: query.query, mode: 'insensitive' } },
      { serialNumber: { contains: query.query, mode: 'insensitive' } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.categoryId) where.categoryId = query.categoryId;

  return prisma.asset.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: { id: 'desc' },
  });
}

export async function getAsset(id: number) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!asset) throw new AppError('Asset not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);
  return asset;
}

export async function updateAsset(id: number, data: z.infer<typeof t.updateAssetSchema>) {
  return prisma.asset.update({
    where: { id },
    data,
  });
}

// ─── State Machine ────────────────────────────────────────────────────────────

export async function transitionAssetStatus(id: number, newStatus: AssetStatus, txClient?: any) {
  const db = txClient ?? prisma;
  
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) throw new AppError('Asset not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

  // Implement strict transition rules if needed, e.g.:
  // if (asset.status === AssetStatus.LOST && newStatus !== AssetStatus.AVAILABLE) throw Error...

  return db.asset.update({
    where: { id },
    data: { 
      status: newStatus,
      lastActivityAt: new Date()
    },
  });
}
