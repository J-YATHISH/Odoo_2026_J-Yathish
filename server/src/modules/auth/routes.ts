import { Router } from 'express';
import { signup, login } from './controller';

const router = Router();

// ─── Auth routes ──────────────────────────────────────────────────────────────
//
// These routes are registered and real. The route table is complete.
// The handlers currently return 501 Not Implemented — business logic is
// deferred to the Auth build step as per the project guardrails.
//
// GET /auth/health — liveness check for this module (public)
// POST /auth/signup — create a new Employee account (public — no auth required to register)
// POST /auth/login  — exchange credentials for a JWT (public)

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'auth' });
});

// Zod validation schemas for these routes will be added alongside the real
// implementation in Step 2. Plugging validate() here without the logic would
// just reject every request with a 400.
router.post('/signup', signup);
router.post('/login', login);

export default router;
