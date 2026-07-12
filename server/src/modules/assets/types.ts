import { z } from 'zod';
import { AssetStatus } from '../../utils/constants';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.number().int().positive(),
  serialNumber: z.string().optional(),
  acquisitionCost: z.number().positive().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  isBookable: z.boolean().optional(),
  isLendable: z.boolean().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const searchAssetsSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  categoryId: z.coerce.number().optional(),
});
