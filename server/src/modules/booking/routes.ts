import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'booking' });
});

// All booking routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

router.get('/', validate(t.searchBookingsSchema), c.listBookings);
router.post('/', validate(t.createBookingSchema), c.createBooking);
router.post('/:id/cancel', c.cancelBooking);

export default router;
