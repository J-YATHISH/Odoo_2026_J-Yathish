import { z } from 'zod';
import { AuditVerification } from '../../utils/constants';

export const createAuditCycleSchema = z.object({
  scopeDept: z.number().int().positive().optional(),
  scopeLoc: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  auditorIds: z.array(z.number().int().positive()).min(1, 'At least one auditor is required'),
});

export const updateAuditItemSchema = z.object({
  verification: z.nativeEnum(AuditVerification),
  notes: z.string().optional(),
});
