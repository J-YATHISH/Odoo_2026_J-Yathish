import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createBooking(req.user!.organizationId, req.user!.id, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listBookings(req.user!.organizationId, req.query as any);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.cancelBooking(req.user!.organizationId, parseInt(req.params.id as string, 10), req.user!.id);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
