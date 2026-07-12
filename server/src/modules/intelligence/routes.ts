import { Router } from 'express';
import * as c from './controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { Permission } from '../../utils/constants';

const router = Router();

// All intelligence routes require authentication
router.use(requireAuth);

// Eco-Predictive Engine endpoints
router.get(
  '/eco-predictive',
  requirePermission([Permission.MANAGE_ASSETS, Permission.MANAGE_ORGANIZATION]),
  c.getOrganizationIntelligence,
);
router.post(
  '/eco-predictive/trigger',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  c.triggerEcoPredictiveEngine,
);

// Cross-Tenant Benchmarking endpoints
router.get(
  '/benchmarks',
  requirePermission([Permission.MANAGE_ORGANIZATION]),
  c.getGlobalBenchmarks,
);

export default router;
