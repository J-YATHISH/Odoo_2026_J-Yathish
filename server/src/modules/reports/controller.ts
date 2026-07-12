import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Reports controller ────────────────────────────────────────────────────────
// TODO: Implement in the Reports build step.

export function getUtilizationReport(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Reports build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function getMaintenanceReport(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Reports build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function getIdleAssetsReport(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Reports build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function exportCsv(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Reports build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
