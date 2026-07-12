import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'reports' });
});

// All reports routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

// Reports view: ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD
router.get('/dashboard', requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), validate(t.getReportsSchema), c.getDashboardReport);

export default router;
