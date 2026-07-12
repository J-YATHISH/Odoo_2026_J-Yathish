import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createAuditCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createAuditCycle(req.orgId!, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function listAuditCycles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listAuditCycles(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function verifyAuditItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.verifyAuditItem(req.orgId!, parseInt(req.params.itemId as string, 10), req.user!.id, req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function closeAuditCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.closeAuditCycle(req.orgId!, parseInt(req.params.id as string, 10));
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
