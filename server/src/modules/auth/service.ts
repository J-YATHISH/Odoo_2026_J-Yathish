// ─── Auth service ─────────────────────────────────────────────────────────────
//
// Business logic for authentication lives here.
// The controller calls this; it never touches the database directly.
//
// TODO: Implement in the Auth build step (Step 2 of the guide):
//   - signup(): hash password with bcrypt, set role = EMPLOYEE always,
//               create Employee record, return sanitized employee data
//   - login():  find employee by email, bcrypt.compare(), sign JWT,
//               write ActivityLog entry for the login event
//   - The JWT payload shape must match AuthenticatedUser in middleware/auth.ts
//
// For now this file exists so the module has its full structure in place
// and other modules can see the correct folder pattern.
