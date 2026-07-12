import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCode, HTTP } from '../utils/constants';

// ─── Global error-handling middleware ─────────────────────────────────────────
//
// Express identifies error-handling middleware by the four-argument signature
// (err, req, res, next). This must be registered LAST in app.ts, after all routes.
//
// What it does:
//   • If the error is an AppError (thrown intentionally from a controller or service),
//     it uses the status code and error code we set.
//   • If the error is an unexpected crash (regular Error), it logs the full stack
//     server-side but only returns a generic SERVER_ERROR to the client. This prevents
//     internal implementation details from leaking in production.
//
// The response shape is always: { error: { message, code, details? } }
// The frontend can always rely on this structure — no raw strings, no HTML error pages.

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // Intentional error — we know what happened and why.
    // Log at warn level (not error) because this is expected application behavior.
    console.warn(`[AppError] ${err.code}: ${err.message}`);

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  // Unexpected error — something crashed that we did not anticipate.
  // Always log the full stack server-side for debugging.
  // Never send the stack or internal message to the client.
  if (err instanceof Error) {
    console.error('[UnhandledError]', err.message);
    console.error(err.stack);
  } else {
    console.error('[UnhandledError] Non-Error thrown:', err);
  }

  res.status(HTTP.SERVER_ERROR).json({
    error: {
      message: 'An unexpected server error occurred. Please try again later.',
      code: ErrorCode.SERVER_ERROR,
    },
  });
}
