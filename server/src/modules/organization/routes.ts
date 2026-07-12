import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  listCategories,
  createCategory,
  listEmployees,
  promoteEmployee,
} from './controller';

const router = Router();

// ─── Organization routes ───────────────────────────────────────────────────────
// All organization routes require authentication.
// Admin-only routes additionally use requireRole([Role.ADMIN]).

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'organization' });
});

// Departments
router.get('/departments', requireAuth, listDepartments);
router.post('/departments', requireAuth, requireRole([Role.ADMIN]), createDepartment);
router.patch('/departments/:id', requireAuth, requireRole([Role.ADMIN]), updateDepartment);

// Asset Categories
router.get('/categories', requireAuth, listCategories);
router.post('/categories', requireAuth, requireRole([Role.ADMIN]), createCategory);

// Employee Directory
router.get('/employees', requireAuth, listEmployees);

// Promote employee role — the ONLY endpoint where role changes are allowed.
router.patch(
  '/employees/:id/promote',
  requireAuth,
  requireRole([Role.ADMIN]),
  promoteEmployee,
);

export default router;
