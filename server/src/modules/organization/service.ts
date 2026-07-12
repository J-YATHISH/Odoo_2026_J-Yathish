// ─── Organization service ──────────────────────────────────────────────────────
//
// TODO: Implement in the Organization build step:
//   - createDepartment(): create with optional parentId for hierarchy
//   - updateDepartment(): block deactivating a dept with active employees
//   - createCategory(): with extraFields JSON
//   - listEmployees(): with search and filter (name, department, role, status)
//   - promoteEmployee(): the ONLY place role changes happen — route is role-guarded
//
// Department hierarchy uses Prisma's self-referencing relation (parentId → id).
// Never build a recursive tree in application code when SQL can do it.
