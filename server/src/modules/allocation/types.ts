// ─── Allocation module type definitions ───────────────────────────────────────
//
// Types for asset allocation and transfer request workflows.
//
// TODO: Define in the Allocation build step:
//   - CreateAllocationBody (assetId, holderId, expectedReturnDate?)
//   - ReturnAllocationBody (conditionAtReturn)
//   - CreateTransferRequestBody (allocationId, toId, reason?)
//   - AllocationConflictResponse (includes currentHolder + suggested alternatives)
//     This is the 409 response shape that the build guide describes in detail:
//     { currentHolder: Employee, suggestions: Asset[] }
