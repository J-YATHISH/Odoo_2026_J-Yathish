import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import { createAuditCycle, markAuditItem, closeAuditCycle, listAuditCycles } from './controller';

const router = Router();

// ─── Audit routes ──────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'audit' });
});

router.get('/', requireAuth, listAuditCycles);
router.post('/', requireAuth, requireRole([Role.ADMIN, Role.ASSET_MANAGER]), createAuditCycle);
router.patch('/items/:id', requireAuth, markAuditItem);
router.post('/:id/close', requireAuth, requireRole([Role.ADMIN, Role.ASSET_MANAGER]), closeAuditCycle);

export default router;
