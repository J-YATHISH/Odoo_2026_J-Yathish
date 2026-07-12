import { Request, Response } from 'express';
import { HTTP, ErrorCode } from '../../utils/constants';

// ─── Auth controller ──────────────────────────────────────────────────────────
//
// Controllers handle HTTP concerns only: read the request, call the service,
// write the response. No business logic belongs here.
//
// TODO: Implement in the Auth build step (Step 2 of the guide):
//   - signup(): call authService.signup(), return 201 with employee data
//   - login():  call authService.login(), return 200 with { token, employee }
//
// Right now each handler returns 501 Not Implemented so the route table is real
// and testable without any fake logic.

export function signup(_req: Request, res: Response): void {
  // TODO: Call authService.signup(req.body) once auth logic is implemented.
  // The signup flow: validate body with Zod, hash password, set role = EMPLOYEE,
  // create Employee record, return sanitized employee (no passwordHash).
  res.status(HTTP.NOT_IMPLEMENTED).json({
    error: {
      message: 'Signup is not yet implemented. Coming in the Auth build step.',
      code: ErrorCode.NOT_IMPLEMENTED,
    },
  });
}

export function login(_req: Request, res: Response): void {
  // TODO: Call authService.login(req.body) once auth logic is implemented.
  // The login flow: find employee by email, bcrypt.compare(), sign JWT with
  // { id, email, role, departmentId }, return { token, employee }.
  res.status(HTTP.NOT_IMPLEMENTED).json({
    error: {
      message: 'Login is not yet implemented. Coming in the Auth build step.',
      code: ErrorCode.NOT_IMPLEMENTED,
    },
  });
}
