import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Booking controller ────────────────────────────────────────────────────────
// TODO: Implement in the Booking build step.

export function createBooking(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Booking build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function cancelBooking(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Booking build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function listBookings(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Booking build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
