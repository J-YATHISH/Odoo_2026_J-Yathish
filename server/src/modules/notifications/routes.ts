import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getNotifications, markNotificationsRead, getActivityLog } from './controller';

const router = Router();

// ─── Notifications routes ──────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'notifications' });
});

// Notifications — polled by the frontend every 8-10s.
// ?unread=true filters to only unread notifications for the badge count.
router.get('/', requireAuth, getNotifications);
router.patch('/read', requireAuth, markNotificationsRead);

// Activity log with type filter: all | alerts | approvals | bookings
router.get('/activity-log', requireAuth, getActivityLog);

export default router;
