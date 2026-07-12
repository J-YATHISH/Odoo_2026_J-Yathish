// ─── Reports service ───────────────────────────────────────────────────────────
//
// TODO: Implement in the Reports build step:
//   - getUtilizationByDept(): Prisma groupBy allocation.holderId → join department
//   - getMaintenanceFrequency(): count MaintenanceRequests grouped by assetId/categoryId
//   - getIdleAssets(): AVAILABLE assets with no booking/allocation in past N days
//   - getAssetsDueForMaintenance(): based on acquisition date + average maintenance interval
//   - getAssetHealthScores(): weighted formula per asset
//     score = clamp(100 - (w1*ageInYears + w2*maintenanceCount - w3*conditionBonus), 0, 100)
//   - exportToCsv(): build CSV string from any report query result
//
// TODO: ML INTEGRATION POINT (future phase):
//   - Predictive maintenance model: train on (assetAge, category, maintenanceHistory)
//     to predict next maintenance date
//   - Resource demand forecasting: ARIMA or simple moving average on booking patterns
//   - These live in a separate /ml service, consume data via this service's queries
