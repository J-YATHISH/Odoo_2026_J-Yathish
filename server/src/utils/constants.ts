// Re-export Prisma-generated enums as named constants.
//
// WHY THIS FILE EXISTS:
// Every module that needs to reference a role, status, or other enum value
// imports from here — not from '@prisma/client' directly scattered around the
// codebase, and never as a raw string literal like 'ADMIN' or 'AVAILABLE'.
// This means: if an enum value ever changes name, there is exactly one place
// to update. TypeScript enforces that every usage is still valid at compile time.

export {
  Role,
  AssetStatus,
  TransferStatus,
  BookingStatus,
  MaintenanceStatus,
  AuditVerification,
  Status,
} from '@prisma/client';

// ─── HTTP response codes as named constants ───────────────────────────────────
// Using named constants instead of magic number literals (e.g. 404) makes the
// intent of each response explicit at the call site.
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
} as const;

// ─── Error codes ─────────────────────────────────────────────────────────────
// Consistent machine-readable codes in every error response.
// Frontend can key off these to display the right message or take the right action.
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DB_ERROR: 'DB_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
