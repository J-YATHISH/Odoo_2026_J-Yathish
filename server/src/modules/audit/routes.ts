import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'audit' }); });

router.use(requireAuth);

router.get('/cycles', c.listAuditCycles);
router.post('/cycles', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.createAuditCycleSchema), c.createAuditCycle);
router.post('/cycles/:id/close', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), c.closeAuditCycle);

router.patch('/items/:itemId/verify', validate(t.updateAuditItemSchema), c.verifyAuditItem);

export default router;
