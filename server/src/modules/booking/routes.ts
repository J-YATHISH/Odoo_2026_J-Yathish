import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { createBooking, cancelBooking, listBookings } from './controller';

const router = Router();

// ─── Booking routes ────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'booking' });
});

router.get('/', requireAuth, listBookings);
router.post('/', requireAuth, createBooking);
router.patch('/:id/cancel', requireAuth, cancelBooking);

export default router;
