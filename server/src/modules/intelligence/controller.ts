import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { HTTP } from '../../utils/constants';

export async function triggerEcoPredictiveEngine(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // In a real system, this would only be triggered by the cron job.
    // We expose it here so admins can force a manual recalculation.
    const result = await service.calculateAssetIntelligence();
    res.status(HTTP.OK).json({
      message: 'Eco-Predictive engine calculation complete',
      ...result
    });
  } catch (err) { next(err); }
}

export async function getOrganizationIntelligence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.getOrganizationIntelligence(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}

export async function getGlobalBenchmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.getGlobalBenchmarks(req.user!.organizationId);
    res.status(HTTP.OK).json(data);
  } catch (err) { next(err); }
}
