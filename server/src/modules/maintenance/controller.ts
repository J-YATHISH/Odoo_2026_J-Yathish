import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Maintenance controller ────────────────────────────────────────────────────
// TODO: Implement in the Maintenance build step.

export function createMaintenanceRequest(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Maintenance build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function updateMaintenanceStatus(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Maintenance build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function listMaintenanceRequests(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Maintenance build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
