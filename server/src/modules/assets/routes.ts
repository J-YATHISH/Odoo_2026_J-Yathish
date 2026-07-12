import { Router } from 'express';
import * as c from './controller';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole, scopeToOrg } from '../../middleware/auth';
import * as t from './types';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'assets' });
});

// All asset routes require authentication and tenant organization scoping
router.use(requireAuth, scopeToOrg);

// Asset view: all 4 roles
router.get('/', validate(t.searchAssetsSchema), c.listAssets);
router.get('/:id', c.getAsset);

// Asset create/edit: ADMIN and ASSET_MANAGER only
router.post('/', requireRole(['ADMIN', 'ASSET_MANAGER']), validate(t.createAssetSchema), c.createAsset);
router.patch('/:id', requireRole(['ADMIN', 'ASSET_MANAGER']), validate(t.updateAssetSchema), c.updateAsset);

export default router;
