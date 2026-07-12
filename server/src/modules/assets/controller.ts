import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createAsset(req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function listAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listAssets(req.query as any);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function getAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.getAsset(parseInt(req.params.id, 10));
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateAsset(parseInt(req.params.id, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
