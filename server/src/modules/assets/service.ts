// ─── Assets service ───────────────────────────────────────────────────────────
//
// TODO: Implement in the Assets build step:
//   - createAsset(): auto-generate tag AF-#### inside a DB transaction to prevent
//     duplicates under concurrent requests
//   - searchAssets(): Postgres ILIKE across tag, serialNumber, name
//   - transitionAssetStatus(): THE shared function all other modules call
//     when an asset's status needs to change. Lives here, imported everywhere.
//     Enforces the valid-transition table from the build guide:
//       AVAILABLE → ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, RETIRED
//       ALLOCATED → AVAILABLE, LOST
//       etc.
//
// TODO: ML INTEGRATION POINT (future phase):
//   - Ghost asset detection: flag AVAILABLE assets where lastActivityAt > 60 days
//     (currently a simple query filter; ML could predict "likely lost" vs "just idle")
//   - Asset health score: currently a weighted formula, ML could learn weights from
//     historical condition data over time
