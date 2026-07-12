import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'allocation' }); });

router.use(requireAuth);

router.post('/', validate(t.createAllocationSchema), c.createAllocation);
router.post('/:id/return', validate(t.returnAssetSchema), c.returnAsset);

router.post('/:allocationId/transfer', validate(t.requestTransferSchema), c.requestTransfer);
router.post('/transfer/:requestId/resolve', validate(t.resolveTransferSchema), c.resolveTransfer);

export default router;
