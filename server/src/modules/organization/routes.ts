import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import * as t from './types';

const router = Router();

// Health
router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'organization' }); });

// All organization routes require authentication
router.use(requireAuth);

// Departments
router.get('/departments', c.listDepartments);
router.post('/departments', requireRole([Role.ADMIN]), validate(t.createDepartmentSchema), c.createDepartment);
router.patch('/departments/:id', requireRole([Role.ADMIN]), validate(t.updateDepartmentSchema), c.updateDepartment);

// Categories
router.get('/categories', c.listCategories);
router.post('/categories', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.createCategorySchema), c.createCategory);
router.patch('/categories/:id', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.updateCategorySchema), c.updateCategory);

// Employees
router.get('/employees', c.listEmployees);
router.patch('/employees/:id/promote', requireRole([Role.ADMIN]), validate(t.promoteEmployeeSchema), c.promoteEmployee);

export default router;
