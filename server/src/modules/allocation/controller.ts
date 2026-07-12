import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createAllocation(req.orgId!, req.body, req.user);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function returnAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.returnAsset(req.orgId!, parseInt(req.params.id as string, 10), req.user!.id, req.body, req.user);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function requestTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.requestTransfer(req.orgId!, parseInt(req.params.allocationId as string, 10), req.user!.id, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function resolveTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.resolveTransfer(req.orgId!, parseInt(req.params.requestId as string, 10), req.user!.id, req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
