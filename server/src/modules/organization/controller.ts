import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function listDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listDepartments(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createDepartment(req.orgId!, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateDepartment(req.orgId!, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listCategories(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createCategory(req.orgId!, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateCategory(req.orgId!, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listEmployees(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function promoteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.promoteEmployee(req.orgId!, parseInt(req.params.id as string, 10), req.body.roleId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listRoles(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.createRole(req.orgId!, req.body);
    res.status(HTTP.CREATED).json(data);
  } catch (err) { next(err); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.updateRole(req.orgId!, parseInt(req.params.id as string, 10), req.body);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteRole(req.orgId!, parseInt(req.params.id as string, 10));
    res.status(HTTP.NO_CONTENT).send();
  } catch (err) { next(err); }
}

export async function getOrganizationInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.getOrganizationInfo(req.orgId!);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
