import { Router } from 'express';
import { signup, login } from './controller';
import { validate } from '../../middleware/validate';
import { signupSchema, loginSchema } from './types';

const router = Router();

// ─── Auth routes ──────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'auth' });
});

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
