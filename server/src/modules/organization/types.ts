import { z } from 'zod';
import { Status } from '../../utils/constants';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  headId: z.number().int().positive().optional(),
  parentId: z.number().int().positive().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  status: z.enum([Status.ACTIVE, Status.INACTIVE]).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  extraFields: z.record(z.any()).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const promoteEmployeeSchema = z.object({
  roleId: z.number().int().positive(),
});

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export const updateRoleSchema = createRoleSchema.partial();
