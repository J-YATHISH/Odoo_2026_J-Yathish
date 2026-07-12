import { z } from 'zod';

export const createBookingSchema = z.object({
  assetId: z.number().int().positive(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const searchBookingsSchema = z.object({
  assetId: z.coerce.number().int().positive().optional(),
});
