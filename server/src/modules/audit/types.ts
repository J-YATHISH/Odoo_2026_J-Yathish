// ─── Audit module type definitions ─────────────────────────────────────────────
//
// Types for audit cycle management and asset verification.
//
// TODO: Define in the Audit build step:
//   - CreateAuditCycleBody (scopeDept?, scopeLoc?, startDate, endDate, auditorIds[])
//   - UpdateAuditItemBody (verification: AuditVerification, notes?)
//   - AuditCycleSummary (total items, verified count, missing count, damaged count)
//   - AuditRiskFlag (assets unverified in 2+ consecutive cycles — Innovation feature)
