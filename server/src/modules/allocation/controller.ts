import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createAllocation(req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function returnAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.returnAsset(parseInt(req.params.id as string, 10), req.user!.id, req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function requestTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.requestTransfer(parseInt(req.params.allocationId as string, 10), req.user!.id, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function resolveTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.resolveTransfer(parseInt(req.params.requestId as string, 10), req.user!.id, req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
