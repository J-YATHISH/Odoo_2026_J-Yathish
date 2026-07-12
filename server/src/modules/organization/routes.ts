import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { Permission } from '../../utils/constants';
import * as t from './types';

const router = Router();

// Health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'organization' });
});

// All organization routes require authentication
router.use(requireAuth);

// Departments
router.get('/departments', c.listDepartments);
router.post(
  '/departments',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.createDepartmentSchema),
  c.createDepartment,
);
router.patch(
  '/departments/:id',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.updateDepartmentSchema),
  c.updateDepartment,
);

// Categories
router.get('/categories', c.listCategories);
router.post(
  '/categories',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.createCategorySchema),
  c.createCategory,
);
router.patch(
  '/categories/:id',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.updateCategorySchema),
  c.updateCategory,
);

// Employees
router.get('/employees', c.listEmployees);
router.patch(
  '/employees/:id/promote',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.promoteEmployeeSchema),
  c.promoteEmployee,
);

// Roles
router.get('/roles', requirePermission([Permission.MANAGE_ORGANIZATION]), c.listRoles);
router.post(
  '/roles',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.createRoleSchema),
  c.createRole,
);
router.patch(
  '/roles/:id',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  validate(t.updateRoleSchema),
  c.updateRole,
);
router.delete('/roles/:id', requirePermission([Permission.MANAGE_ORGANIZATION]), c.deleteRole);

export default router;
