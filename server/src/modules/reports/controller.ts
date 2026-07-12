import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function getDashboardReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let deptId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;

    // Enforce that a DEPARTMENT_HEAD can only see reports for their own department
    if (req.user!.role === 'DEPARTMENT_HEAD') {
      deptId = req.user!.departmentId || -1; // If departmentId is null, use -1 to avoid returning general org data
    }

    const data = await service.getFullDashboardReport(req.orgId!, deptId);
    res.status(HTTP.OK).json(data);
  } catch (err) {
    next(err);
  }
}
