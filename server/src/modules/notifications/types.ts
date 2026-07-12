import { z } from 'zod';

export const getNotificationsSchema = z.object({
  limit: z.coerce.number().int().positive().default(50),
});
