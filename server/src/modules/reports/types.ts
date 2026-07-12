import { z } from 'zod';

export const getReportsSchema = z.object({
  departmentId: z.coerce.number().int().positive().optional(),
});
