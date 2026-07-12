import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';

// ─── Departments ──────────────────────────────────────────────────────────────

export async function listDepartments(organizationId: number) {
  return prisma.department.findMany({
    where: { organizationId },
    include: {
      head: { select: { id: true, name: true, email: true } },
      parent: { select: { id: true, name: true } },
      _count: { select: { employees: true } },
    },
  });
}

export async function createDepartment(organizationId: number, data: z.infer<typeof t.createDepartmentSchema>) {
  const existing = await prisma.department.findUnique({ where: { organizationId_name: { organizationId, name: data.name } } });
  if (existing) throw new AppError('Department name already exists', HTTP.CONFLICT, ErrorCode.CONFLICT);

  return prisma.department.create({ data: { ...data, organizationId } });
}

export async function updateDepartment(organizationId: number, id: number, data: z.infer<typeof t.updateDepartmentSchema>) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept || dept.organizationId !== organizationId) throw new AppError('Not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

  // Prevent deactivation if employees still exist
  if (data.status === 'INACTIVE') {
    const activeEmployees = await prisma.employee.count({ where: { organizationId, departmentId: id, status: 'ACTIVE' } });
    if (activeEmployees > 0) {
      throw new AppError('Cannot deactivate department with active employees.', HTTP.BAD_REQUEST, ErrorCode.BAD_REQUEST);
    }
  }

  return prisma.department.update({
    where: { id },
    data,
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(organizationId: number) {
  return prisma.assetCategory.findMany({
    where: { organizationId },
    include: { _count: { select: { assets: true } } },
  });
}

export async function createCategory(organizationId: number, data: z.infer<typeof t.createCategorySchema>) {
  const existing = await prisma.assetCategory.findUnique({ where: { organizationId_name: { organizationId, name: data.name } } });
  if (existing) throw new AppError('Category name already exists', HTTP.CONFLICT, ErrorCode.CONFLICT);

  return prisma.assetCategory.create({ data: { ...data, extraFields: data.extraFields ?? undefined, organizationId } });
}

export async function updateCategory(organizationId: number, id: number, data: z.infer<typeof t.updateCategorySchema>) {
  const cat = await prisma.assetCategory.findUnique({ where: { id } });
  if (!cat || cat.organizationId !== organizationId) throw new AppError('Not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

  return prisma.assetCategory.update({
    where: { id },
    data: { ...data, extraFields: data.extraFields ?? undefined },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function listEmployees(organizationId: number) {
  return prisma.employee.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      department: { select: { id: true, name: true } },
    },
  });
}

export async function promoteEmployee(organizationId: number, id: number, role: z.infer<typeof t.promoteEmployeeSchema>['role']) {
  const emp = await prisma.employee.findUnique({ where: { id } });
  if (!emp || emp.organizationId !== organizationId) throw new AppError('Not found', HTTP.NOT_FOUND, ErrorCode.NOT_FOUND);

  return prisma.employee.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, role: true },
  });
}
