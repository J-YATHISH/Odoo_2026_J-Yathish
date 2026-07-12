import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createAuditCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createAuditCycle(req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function listAuditCycles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listAuditCycles();
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function verifyAuditItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.verifyAuditItem(parseInt(req.params.itemId, 10), req.user!.id, req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function closeAuditCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.closeAuditCycle(parseInt(req.params.id, 10));
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
