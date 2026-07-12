// ─── Maintenance module type definitions ───────────────────────────────────────
//
// Types for maintenance request kanban workflow.
//
// TODO: Define in the Maintenance build step:
//   - CreateMaintenanceRequestBody (assetId, issueDescription, priority?, photoUrl?)
//   - UpdateMaintenanceStatusBody (status, technicianName?, resolvedAt?)
//   - MaintenanceKanbanColumn (for board view grouping by status)
//
// INNOVATION NOTE (keyword-based priority auto-suggestion):
//   The service layer will scan issueDescription for keywords like
//   "broken", "not working", "urgent", "critical" and auto-suggest
//   priority = "High". This is a keyword rule, not ML — state this plainly.
