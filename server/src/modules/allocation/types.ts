import { z } from 'zod';
import { TransferStatus } from '../../utils/constants';

export const createAllocationSchema = z.object({
  assetId: z.number().int().positive(),
  holderId: z.number().int().positive(),
  expectedReturnDate: z.coerce.date().optional(),
});

export const returnAssetSchema = z.object({
  conditionAtReturn: z.string().optional(),
});

export const requestTransferSchema = z.object({
  toId: z.number().int().positive(),
  reason: z.string().optional(),
});

export const resolveTransferSchema = z.object({
  status: z.enum([TransferStatus.APPROVED, TransferStatus.REJECTED]),
});
