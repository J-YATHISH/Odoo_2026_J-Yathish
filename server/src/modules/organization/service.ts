import prisma from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { HTTP, ErrorCode } from '../../utils/constants';
import * as t from './types';
import { z } from 'zod';

// ─── Departments ──────────────────────────────────────────────────────────────

export async function listDepartments() {
  return prisma.department.findMany({
    include: {
      head: { select: { id: true, name: true, email: true } },
      parent: { select: { id: true, name: true } },
      _count: { select: { employees: true } },
    },
  });
}

export async function createDepartment(data: z.infer<typeof t.createDepartmentSchema>) {
  const existing = await prisma.department.findUnique({ where: { name: data.name } });
  if (existing) throw new AppError('Department name already exists', HTTP.CONFLICT, ErrorCode.CONFLICT);

  return prisma.department.create({ data });
}

export async function updateDepartment(id: number, data: z.infer<typeof t.updateDepartmentSchema>) {
  // Prevent deactivation if employees still exist
  if (data.status === 'INACTIVE') {
    const activeEmployees = await prisma.employee.count({ where: { departmentId: id, status: 'ACTIVE' } });
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

export async function listCategories() {
  return prisma.assetCategory.findMany({
    include: { _count: { select: { assets: true } } },
  });
}

export async function createCategory(data: z.infer<typeof t.createCategorySchema>) {
  const existing = await prisma.assetCategory.findUnique({ where: { name: data.name } });
  if (existing) throw new AppError('Category name already exists', HTTP.CONFLICT, ErrorCode.CONFLICT);

  return prisma.assetCategory.create({ data: { ...data, extraFields: data.extraFields ?? undefined } });
}

export async function updateCategory(id: number, data: z.infer<typeof t.updateCategorySchema>) {
  return prisma.assetCategory.update({
    where: { id },
    data: { ...data, extraFields: data.extraFields ?? undefined },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function listEmployees() {
  return prisma.employee.findMany({
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

export async function promoteEmployee(id: number, role: z.infer<typeof t.promoteEmployeeSchema>['role']) {
  return prisma.employee.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, role: true },
  });
}
