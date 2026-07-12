import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'reports' }); });

router.use(requireAuth);

router.get('/dashboard', validate(t.getReportsSchema), c.getDashboardReport);

export default router;
