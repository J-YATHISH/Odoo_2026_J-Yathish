import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode, AssetStatus, MaintenanceStatus } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';
import axios from 'axios';
import { transitionAssetStatus } from '../assets/service';

export async function createMaintenanceRequest(
  organizationId: number,
  employeeId: number,
  data: z.infer<typeof t.createMaintenanceSchema>,
) {
  // Keyword scanner for auto-priority
  const highPriorityKeywords = [
    'urgent',
    'broken',
    'shattered',
    'smoke',
    'fire',
    'leak',
    'critical',
  ];
  const descLower = data.issueDescription.toLowerCase();

  let priority = 'Medium';
  if (highPriorityKeywords.some((kw) => descLower.includes(kw))) {
    priority = 'High';
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        organizationId,
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
        organizationId,
        employeeId,
        action: 'RAISED_MAINTENANCE',
        entityType: 'Asset',
        entityId: data.assetId,
      },
    });

    return request;
  });
}

export async function createZeroTouchMaintenanceRequest(
  organizationId: number,
  employeeId: number,
  data: z.infer<typeof t.createZeroTouchMaintenanceSchema>,
) {
  // 1. Fetch allocated assets for this employee for zero-touch fuzzy matching
  const allocations = await prisma.allocation.findMany({
    where: { holderId: employeeId, isActive: true },
    include: { asset: { include: { category: true } } },
  });

  if (allocations.length === 0) {
    throw new AppError('You have no assigned devices to report an issue for.', HTTP.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
  }

  // 2. Fuzzy match the asset based on issue description keywords
  let matchedAsset = allocations[0].asset; // Default to first asset if no text match
  const descLower = data.issueDescription.toLowerCase();
  
  for (const alloc of allocations) {
    const assetName = alloc.asset.name.toLowerCase();
    const catName = alloc.asset.category.name.toLowerCase();
    if (descLower.includes(assetName) || descLower.includes(catName)) {
      matchedAsset = alloc.asset;
      break; // Found a match!
    }
  }

  // 3. Call the Python AI Model via Colab ngrok URL
  let priority = 'Medium';
  let issueCategory = 'OTHER';
  let aiAssessed = false;
  const AI_URL = process.env.AI_MODEL_URL;

  if (AI_URL) {
    try {
      const response = await axios.post(`${AI_URL}/predict`, {
        issueDescription: data.issueDescription,
        organizationId,
        assetCategoryName: matchedAsset.category.name
      });
      priority = response.data.priority;
      issueCategory = response.data.issueCategory;
      aiAssessed = true;
    } catch (err) {
      console.error("AI Model error, falling back to heuristic:", err);
      // Fallback heuristic if AI is down
      const highPriorityKeywords = ['urgent', 'broken', 'shattered', 'smoke', 'fire', 'leak', 'critical'];
      if (highPriorityKeywords.some((kw) => descLower.includes(kw))) priority = 'High';
    }
  } else {
     // Fallback heuristic if AI is not configured
     const highPriorityKeywords = ['urgent', 'broken', 'shattered', 'smoke', 'fire', 'leak', 'critical'];
     if (highPriorityKeywords.some((kw) => descLower.includes(kw))) priority = 'High';
  }

  // 4. Save fully categorized ticket to Postgres
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        organizationId,
        assetId: matchedAsset.id,
        raisedById: employeeId,
        issueDescription: data.issueDescription,
        photoUrl: data.photoUrl,
        priority,
        issueCategory,
        aiAssessed,
        status: MaintenanceStatus.PENDING,
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        employeeId,
        action: 'RAISED_MAINTENANCE_ZERO_TOUCH',
        entityType: 'Asset',
        entityId: matchedAsset.id,
      },
    });

    return request;
  });
}

export async function listMaintenanceRequests(organizationId: number) {
  return prisma.maintenanceRequest.findMany({
    where: { organizationId },
    include: {
      asset: { select: { name: true, tag: true } },
      raisedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateMaintenanceRequest(
  organizationId: number,
  id: number,
  data: z.infer<typeof t.updateMaintenanceSchema>,
) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request || request.organizationId !== organizationId)
    throw new AppError('Maintenance request not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

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
    if (
      data.status === MaintenanceStatus.IN_PROGRESS ||
      data.status === MaintenanceStatus.APPROVED
    ) {
      await transitionAssetStatus(
        organizationId,
        request.assetId,
        AssetStatus.UNDER_MAINTENANCE,
        tx,
      );
    } else if (data.status === MaintenanceStatus.RESOLVED) {
      await transitionAssetStatus(organizationId, request.assetId, AssetStatus.AVAILABLE, tx);
    }

    return updated;
  });
}
