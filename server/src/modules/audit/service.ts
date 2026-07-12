// ─── Audit service ─────────────────────────────────────────────────────────────
//
// TODO: Implement in the Audit build step:
//   - createAuditCycle(): create cycle + auto-generate AuditItem rows for in-scope assets
//     Scope = all assets in a department, or all assets at a location, or both
//   - markAuditItem(): update verification (VERIFIED/MISSING/DAMAGED) + notes
//   - closeAuditCycle(): transaction — every MISSING item → transitionAssetStatus(LOST)
//     Return discrepancy report (missing + damaged items list)
//   - flagAuditRiskAssets(): find assets unverified in 2+ consecutive closed cycles
//     (Innovation feature — query consecutive cycles where same asset has no VERIFIED entry)
