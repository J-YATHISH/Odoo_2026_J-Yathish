import cron from 'node-cron';
import { calculateAssetIntelligence } from './service';

// Schedule the task to run every day at midnight (00:00)
export function initIntelligenceCron() {
  console.log('Initializing Autonomous Intelligence Engine Cron Job (runs at 00:00 daily)');

  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Starting daily Eco-Predictive Asset Intelligence calculation...');
    try {
      const result = await calculateAssetIntelligence();
      console.log(`[CRON] Success! Processed ${result.processedCount} assets.`);
      console.log(
        `[CRON] Autonomously generated ${result.maintenanceGeneratedCount} preventative maintenance requests.`,
      );
    } catch (err) {
      console.error('[CRON] Failed to run daily intelligence calculation:', err);
    }
  });
}
