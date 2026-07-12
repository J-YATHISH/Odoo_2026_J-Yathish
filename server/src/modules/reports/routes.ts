import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getUtilizationReport, getMaintenanceReport, getIdleAssetsReport, exportCsv } from './controller';

const router = Router();

// ─── Reports routes ────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'reports' });
});

router.get('/utilization', requireAuth, getUtilizationReport);
router.get('/maintenance', requireAuth, getMaintenanceReport);
router.get('/idle-assets', requireAuth, getIdleAssetsReport);

// CSV export endpoint — builds and streams the CSV file server-side.
router.get('/export/:reportType', requireAuth, exportCsv);

export default router;
