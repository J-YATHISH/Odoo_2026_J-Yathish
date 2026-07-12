import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'maintenance' }); });

router.use(requireAuth);

router.get('/', c.listMaintenanceRequests);
router.post('/', validate(t.createMaintenanceSchema), c.createMaintenanceRequest);
router.patch('/:id', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.updateMaintenanceSchema), c.updateMaintenanceRequest);

export default router;
