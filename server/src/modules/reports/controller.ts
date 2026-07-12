import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function getDashboardReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deptId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;
    const data = await service.getFullDashboardReport(req.user!.organizationId, deptId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
