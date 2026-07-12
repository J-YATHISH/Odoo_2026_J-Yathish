// ─── Booking service ───────────────────────────────────────────────────────────
//
// TODO: Implement in the Booking build step:
//   - createBooking(): two-layer overlap check
//       1. App-level: SELECT * FROM Booking WHERE assetId=$1 AND status IN ('UPCOMING','ONGOING')
//                     AND startTime < $endTime AND endTime > $startTime
//       2. DB-level: EXCLUDE constraint catches any race conditions the app check misses
//     On conflict: return 409 with next 2-3 open time slots as suggestions
//   - cancelBooking(): set status CANCELLED
//   - listBookingsForAsset(): for calendar view
//   - autoCompleteOverdue(): called periodically (or on-read) to move UPCOMING→ONGOING
//     and ONGOING→COMPLETED based on current time
