import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP, ErrorCode } from '../utils/constants';

// ─── Zod validation middleware factory ───────────────────────────────────────
//
// Usage — plug directly into any route that has a request body to validate:
//
//   import { z } from 'zod';
//   import { validate } from '../../middleware/validate';
//
//   const createAssetSchema = z.object({
//     name: z.string().min(2).max(100),
//     categoryId: z.number().int().positive(),
//   });
//
//   router.post('/', requireAuth, validate(createAssetSchema), createAsset);
//
// On validation failure, the response is:
//   HTTP 400 { error: { message, code: 'VALIDATION_ERROR', details: { fieldName: 'message' } } }
//
// On success, req.body is replaced with the Zod-parsed (and type-coerced) value,
// so downstream controllers receive clean, typed data.
//
// WHY REPLACE req.body: Zod's .parse() applies default values and type coercions
// (e.g. string "42" → number 42 if you used z.coerce.number()). If we don't
// replace req.body, the controller gets the raw uncoerced input, defeating the
// purpose of Zod's output type.

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = formatZodErrors(result.error);

      res.status(HTTP.BAD_REQUEST).json({
        error: {
          message: 'Validation failed. Please check the highlighted fields.',
          code: ErrorCode.VALIDATION_ERROR,
          details: fieldErrors,
        },
      });
      return;
    }

    // Replace req.body with the parsed, coerced, default-applied result.
    req.body = result.data;
    next();
  };
}

// ─── Format Zod errors into a flat { fieldName: message } map ─────────────────
//
// Zod produces nested error paths for nested objects (e.g. ["address", "city"]).
// We join them with a dot so the frontend gets "address.city" as the field key,
// which matches how React Hook Form names nested fields.
function formatZodErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path.length > 0 ? path : '_root';
    // Only keep the first error per field — showing multiple messages per field
    // at once is noisy and unhelpful in a form UI.
    if (!(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
