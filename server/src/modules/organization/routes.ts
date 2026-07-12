import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

// Health
router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'organization' }); });

// All organization routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

// Org Info
router.get('/info', c.getOrganizationInfo);

// Departments
router.get('/departments', c.listDepartments);
router.post('/departments', requireRole(['ADMIN']), validate(t.createDepartmentSchema), c.createDepartment);
router.patch('/departments/:id', requireRole(['ADMIN']), validate(t.updateDepartmentSchema), c.updateDepartment);

// Categories
router.get('/categories', c.listCategories);
router.post('/categories', requireRole(['ADMIN']), validate(t.createCategorySchema), c.createCategory);
router.patch('/categories/:id', requireRole(['ADMIN']), validate(t.updateCategorySchema), c.updateCategory);

// Employees
router.get('/employees', c.listEmployees);
router.patch('/employees/:id/promote', requireRole(['ADMIN']), validate(t.promoteEmployeeSchema), c.promoteEmployee);

// Roles
router.get('/roles', requireRole(['ADMIN']), c.listRoles);
router.post('/roles', requireRole(['ADMIN']), validate(t.createRoleSchema), c.createRole);
router.patch('/roles/:id', requireRole(['ADMIN']), validate(t.updateRoleSchema), c.updateRole);
router.delete('/roles/:id', requireRole(['ADMIN']), c.deleteRole);

export default router;
