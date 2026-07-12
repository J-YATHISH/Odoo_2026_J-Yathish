import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'notifications' }); });

// All notification routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

router.get('/activity', validate(t.getNotificationsSchema), c.listActivityLogs);
router.get('/', c.listMyNotifications);
router.patch('/:id/read', c.markNotificationRead);

export default router;
