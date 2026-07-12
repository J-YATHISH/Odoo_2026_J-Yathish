import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Organization controller ───────────────────────────────────────────────────
//
// Handles: Departments, AssetCategories, Employee Directory, role promotion.
// TODO: Implement in the Organization build step.

export function listDepartments(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function createDepartment(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function updateDepartment(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function listCategories(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function createCategory(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function listEmployees(_req: Request, res: Response): void {
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}

export function promoteEmployee(_req: Request, res: Response): void {
  // This is the ONLY endpoint where an employee's role can change.
  // Route is guarded with requireRole([Role.ADMIN]).
  res.status(HTTP.NOT_IMPLEMENTED).json({ error: { message: 'Coming in Organization build step.', code: ErrorCode.NOT_IMPLEMENTED } });
}
