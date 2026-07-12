import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { Permission } from '../../utils/constants';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'maintenance' });
});

router.use(requireAuth);

router.get('/', c.listMaintenanceRequests);
router.post('/', validate(t.createMaintenanceSchema), c.createMaintenanceRequest);
router.patch(
  '/:id',
  requirePermission([Permission.MANAGE_MAINTENANCE]),
  validate(t.updateMaintenanceSchema),
  c.updateMaintenanceRequest,
);

export default router;
