import { Request, Response, NextFunction } from 'express';
import * as authService from './service';
import { HTTP } from '../../utils/constants';

// ─── Auth controller ──────────────────────────────────────────────────────────

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const employee = await authService.signup(req.body);
    res.status(HTTP.CREATED).json(employee);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(HTTP.OK).json(result);
  } catch (err) {
    next(err);
  }
}
