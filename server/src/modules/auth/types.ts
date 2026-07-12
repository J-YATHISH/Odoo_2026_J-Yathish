import { Role } from '../../utils/constants';

// ─── Auth module type definitions ─────────────────────────────────────────────
//
// These types define the shapes of request bodies, service inputs/outputs, and
// JWT payloads for the auth module.
//
// When the full auth logic is implemented in the next build step, the controller
// and service will import from here — keeping all type definitions in one place
// per module so there's no guessing where a type lives.

// What the client sends when registering a new employee account.
// Note: role is NOT accepted from the client — it is always set to EMPLOYEE
// server-side, even if a tampered request includes it. Server enforces this.
export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
  departmentId?: number;
}

// What the client sends when logging in.
export interface LoginRequestBody {
  email: string;
  password: string;
}

// What the login service returns on success.
export interface LoginResult {
  token: string;
  employee: {
    id: number;
    name: string;
    email: string;
    role: Role;
    departmentId: number | null;
  };
}
