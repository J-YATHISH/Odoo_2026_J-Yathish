import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Assets controller ─────────────────────────────────────────────────────────
//
// Handles: asset CRUD, directory search, status overview.
// Status changes are NEVER done here directly — only via transitionAssetStatus().
// TODO: Implement in the Assets build step.

export function listAssets(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Assets build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function getAsset(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Assets build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function createAsset(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Assets build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function updateAsset(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Assets build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
