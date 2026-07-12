import { z } from 'zod';
import { MaintenanceStatus } from '../../utils/constants';

export const createMaintenanceSchema = z.object({
  assetId: z.number().int().positive(),
  issueDescription: z.string().min(5, 'Please provide a detailed description'),
  photoUrl: z.string().url().optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.nativeEnum(MaintenanceStatus).optional(),
  technicianName: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});
