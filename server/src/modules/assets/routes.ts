import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '../../utils/constants';
import { listAssets, getAsset, createAsset, updateAsset } from './controller';

const router = Router();

// ─── Asset routes ──────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'assets' });
});

router.get('/', requireAuth, listAssets);
router.get('/:id', requireAuth, getAsset);
router.post('/', requireAuth, requireRole([Role.ADMIN, Role.ASSET_MANAGER]), createAsset);
router.patch('/:id', requireAuth, requireRole([Role.ADMIN, Role.ASSET_MANAGER]), updateAsset);

export default router;
