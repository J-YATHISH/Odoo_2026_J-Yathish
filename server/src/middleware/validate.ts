import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP, ErrorCode } from '../utils/constants';

// ─── Zod validation middleware factory ───────────────────────────────────────
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // For GET requests, validate query parameters; otherwise validate request body.
    const target = req.method === 'GET' ? req.query : req.body;
    const result = schema.safeParse(target || {});

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

    // Replace target with the parsed, coerced, default-applied result.
    if (req.method === 'GET') {
      // Define req.query as a standard value property on this request instance
      // to override the Express prototype getter. This guarantees coerced types
      // (like numbers) are preserved downstream.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req.body = result.data;
    }
    next();
  };
}

// ─── Format Zod errors into a flat { fieldName: message } map ─────────────────
function formatZodErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path.length > 0 ? path : '_root';
    if (!(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
