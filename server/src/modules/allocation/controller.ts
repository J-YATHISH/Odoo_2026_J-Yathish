import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Allocation controller ─────────────────────────────────────────────────────
// TODO: Implement in the Allocation build step.

export function createAllocation(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Allocation build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function returnAllocation(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Allocation build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function createTransferRequest(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Allocation build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function approveTransfer(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Allocation build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function rejectTransfer(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Allocation build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
