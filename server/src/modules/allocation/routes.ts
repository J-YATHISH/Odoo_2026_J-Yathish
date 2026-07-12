import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'allocation' });
});

// All allocation routes require authentication and organization scoping
router.use(requireAuth, scopeToOrg);

// Allocation create + approve: ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD
router.post('/', requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), validate(t.createAllocationSchema), c.createAllocation);
router.post('/:id/return', requireRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), validate(t.returnAssetSchema), c.returnAsset);

// Allocation request (initiate only): EMPLOYEE
router.post('/:allocationId/transfer', requireRole(['EMPLOYEE']), validate(t.requestTransferSchema), c.requestTransfer);

// Resolving a transfer (can be any authenticated recipient)
router.post('/transfer/:requestId/resolve', validate(t.resolveTransferSchema), c.resolveTransfer);

export default router;
