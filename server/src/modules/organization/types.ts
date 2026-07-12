import { z } from 'zod';
import { Role, Status } from '../../utils/constants';

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
  role: z.enum([Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE]),
});
