import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Notifications controller ──────────────────────────────────────────────────
// TODO: Implement in the Notifications build step.

export function getNotifications(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Notifications build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function markNotificationsRead(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Notifications build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function getActivityLog(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Notifications build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
