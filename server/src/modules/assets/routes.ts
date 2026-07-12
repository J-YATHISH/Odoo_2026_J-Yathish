import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok', module: 'assets' }); });

router.use(requireAuth);

router.get('/', validate(t.searchAssetsSchema), c.listAssets);
router.post('/', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.createAssetSchema), c.createAsset);
router.get('/:id', c.getAsset);
router.patch('/:id', requireRole([Role.ADMIN, Role.ASSET_MANAGER]), validate(t.updateAssetSchema), c.updateAsset);

export default router;
