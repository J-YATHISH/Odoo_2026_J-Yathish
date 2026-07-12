import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import {
  createAllocation,
  returnAllocation,
  createTransferRequest,
  approveTransfer,
  rejectTransfer,
} from './controller';

const router = Router();

// ─── Allocation routes ─────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'allocation' });
});

// Allocations
router.post('/', requireAuth, requireRole([Role.ADMIN, Role.ASSET_MANAGER]), createAllocation);
router.patch('/:id/return', requireAuth, returnAllocation);

// Transfer Requests
router.post('/transfer-requests', requireAuth, createTransferRequest);
router.patch(
  '/transfer-requests/:id/approve',
  requireAuth,
  requireRole([Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD]),
  approveTransfer,
);
router.patch(
  '/transfer-requests/:id/reject',
  requireAuth,
  requireRole([Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD]),
  rejectTransfer,
);

export default router;
