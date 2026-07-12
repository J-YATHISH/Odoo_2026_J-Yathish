import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'audit' });
});

// All audit routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

router.get('/cycles', c.listAuditCycles);

// Audit cycle create/close: ADMIN, ASSET_MANAGER
router.post('/cycles', requireRole(['ADMIN', 'ASSET_MANAGER']), validate(t.createAuditCycleSchema), c.createAuditCycle);
router.post('/cycles/:id/close', requireRole(['ADMIN', 'ASSET_MANAGER']), c.closeAuditCycle);

// Audit item verify: any employee (scoped by cycle assignment check in service)
router.patch('/items/:itemId/verify', validate(t.updateAuditItemSchema), c.verifyAuditItem);

export default router;
