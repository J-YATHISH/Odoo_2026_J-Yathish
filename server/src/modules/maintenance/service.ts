// ─── Maintenance service ───────────────────────────────────────────────────────
//
// TODO: Implement in the Maintenance build step:
//   - createMaintenanceRequest(): keyword-based priority auto-suggestion
//     (scan issueDescription for "broken", "not working", "urgent", "critical")
//     This is a keyword rule — state it plainly in demo, not ML
//   - approveRequest(): transitionAssetStatus(UNDER_MAINTENANCE), notify requester
//   - assignTechnician(): set technicianName, status → TECHNICIAN_ASSIGNED
//   - resolveRequest(): transitionAssetStatus(AVAILABLE), set resolvedAt
//   - rejectRequest(): write Notification to requester explaining reason
