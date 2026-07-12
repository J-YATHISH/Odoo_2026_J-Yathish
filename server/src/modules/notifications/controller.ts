import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function listActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listActivityLogs(req.query as any);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listMyNotifications(req.user!.id);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.markNotificationRead(parseInt(req.params.id, 10), req.user!.id);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
