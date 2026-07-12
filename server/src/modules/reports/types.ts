// ─── Reports module type definitions ───────────────────────────────────────────
//
// Types for analytics and report generation.
//
// TODO: Define in the Reports build step:
//   - UtilizationByDeptReport (active allocations grouped by department)
//   - MaintenanceFrequencyReport (maintenance count by asset/category)
//   - IdleAssetsReport (no activity in N days)
//   - AssetHealthScoreReport (0-100, weighted formula — Innovation feature)
//     Formula: score = clamp(100 - (w1*ageInYears + w2*maintenanceCount - w3*conditionBonus), 0, 100)
//     Weights are configurable constants, not hardcoded magic numbers.
//
// TODO: ML INTEGRATION POINT (future phase, after full system is working):
//   - Predictive maintenance: use historical MaintenanceRequest data to predict
//     next failure date per asset category
//   - Utilization forecasting: predict seasonal demand peaks per department
//   - Anomaly detection: flag unusual allocation patterns
//   These will be implemented as a separate ML service once the core data exists.
