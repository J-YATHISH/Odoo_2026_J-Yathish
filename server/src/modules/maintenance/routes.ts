import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'maintenance' }); });

// All maintenance routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

// Maintenance raise request / view: all 4 roles
router.get('/', c.listMaintenanceRequests);
router.post('/', validate(t.createMaintenanceSchema), c.createMaintenanceRequest);

// Maintenance approve/assign technician: ADMIN, ASSET_MANAGER
router.patch('/:id', requireRole(['ADMIN', 'ASSET_MANAGER']), validate(t.updateMaintenanceSchema), c.updateMaintenanceRequest);

export default router;
