import { ErrorCodeType } from './constants';

// A typed error class that every module throws when something goes wrong in a
// predictable way (bad input, not found, conflict, etc.).
//
// The global error handler in middleware/errorHandler.ts catches these and
// formats them into the consistent { error: { message, code, details? } }
// JSON shape the frontend expects.
//
// Plain JS Error objects (unexpected crashes) are also caught by the global
// handler — they are logged with their full stack server-side and returned to
// the client as a generic SERVER_ERROR without exposing internal details.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ErrorCodeType, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains correct prototype chain for instanceof checks in TypeScript.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
