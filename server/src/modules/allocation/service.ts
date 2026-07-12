// ─── Allocation service ────────────────────────────────────────────────────────
//
// TODO: Implement in the Allocation build step:
//   - createAllocation(): check for existing active allocation, return 409 with
//     currentHolder info + up to 3 alternative assets in same category
//   - returnAllocation(): mark isActive=false, set returnedAt + conditionAtReturn,
//     call transitionAssetStatus(AVAILABLE)
//   - createTransferRequest(): validate allocation is active, create request
//   - approveTransfer(): single transaction — deactivate old allocation, create new,
//     mark transfer COMPLETED, write ActivityLog + Notification
//   - rejectTransfer(): mark REJECTED, write Notification to requester
//
// The partial unique index on Allocation(assetId) WHERE isActive=true means
// even a bug in this service cannot create two active allocations for one asset.
