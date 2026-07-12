import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Audit controller ──────────────────────────────────────────────────────────
// TODO: Implement in the Audit build step.

export function createAuditCycle(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Audit build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function markAuditItem(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Audit build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function closeAuditCycle(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Audit build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function listAuditCycles(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Audit build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
