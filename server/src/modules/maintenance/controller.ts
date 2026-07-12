import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function createMaintenanceRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await service.createMaintenanceRequest(
      req.user!.organizationId,
      req.user!.id,
      req.body,
    );
    res.status(HTTP.CREATED).json(data);
  } catch (err) {
    next(err);
  }
}

export async function listMaintenanceRequests(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await service.listMaintenanceRequests(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateMaintenanceRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await service.updateMaintenanceRequest(
      req.user!.organizationId,
      parseInt(req.params.id as string, 10),
      req.body,
    );
    res.status(HTTP.OK).json(data);
  } catch (err) {
    next(err);
  }
}
