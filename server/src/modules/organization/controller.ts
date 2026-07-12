import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function listDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listDepartments(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createDepartment(req.user!.organizationId, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateDepartment(req.user!.organizationId, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listCategories(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createCategory(req.user!.organizationId, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateCategory(req.user!.organizationId, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listEmployees(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function promoteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.promoteEmployee(req.user!.organizationId, parseInt(req.params.id as string, 10), req.body.roleId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listRoles(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createRole(req.user!.organizationId, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateRole(req.user!.organizationId, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteRole(req.user!.organizationId, parseInt(req.params.id as string, 10));
    res.status(HTTP.NO_CONTENT).send();
  } catch (err) { next(err); }
}
