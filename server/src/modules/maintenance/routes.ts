import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import {
  createMaintenanceRequest,
  updateMaintenanceStatus,
  listMaintenanceRequests,
} from './controller';

const router = Router();

// ─── Maintenance routes ────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'maintenance' });
});

router.get('/', requireAuth, listMaintenanceRequests);
router.post('/', requireAuth, createMaintenanceRequest);

// Status transitions (approve, assign, resolve, reject) use one handler
// that reads the target status from the request body.
// Role guard covers asset managers and admins — not all employees can approve.
router.patch(
  '/:id/status',
  requireAuth,
  requireRole([Role.ADMIN, Role.ASSET_MANAGER]),
  updateMaintenanceStatus,
);

export default router;
