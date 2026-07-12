// ─── Booking module type definitions ──────────────────────────────────────────
//
// Types for resource booking and calendar management.
//
// TODO: Define in the Booking build step:
//   - CreateBookingBody (assetId, startTime, endTime)
//   - BookingOverlapConflictResponse (includes next available slots suggestion)
//   - BookingCalendarEntry (for calendar view rendering)
//
// IMPORTANT: Overlap prevention is two-layered:
//   1. App-level pre-check in the service (fast user feedback)
//   2. DB-level EXCLUDE constraint (final guarantee, even against race conditions)
// Both layers must be in place — see migrations/002_add_raw_constraints for the constraint.
