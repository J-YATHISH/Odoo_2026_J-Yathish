// ─── Assets module type definitions ───────────────────────────────────────────
//
// Types for asset registration, directory, and status lifecycle management.
//
// TODO: Define in the Assets build step:
//   - CreateAssetBody (name, categoryId, serialNumber?, acquisitionCost?, etc.)
//   - UpdateAssetBody (partial update)
//   - AssetStatusTransition (from/to pairs — enforced by transitionAssetStatus())
//   - AssetWithCategory (joined response type)
//   - AssetDirectoryFilter (for search/filter query params)
//
// NOTE: Asset status is NEVER changed directly via a route body field.
// All status transitions go through the shared transitionAssetStatus() service.
// This rule is enforced by not including `status` in any request body type here.
