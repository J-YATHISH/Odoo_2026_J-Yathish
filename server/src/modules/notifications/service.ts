// ─── Notifications service ─────────────────────────────────────────────────────
//
// TODO: Implement in the Notifications build step:
//   - createNotification(): used internally by other services — always inside a transaction
//   - getNotifications(): for the polling endpoint, filter by employeeId + isRead
//   - markAsRead(): mark one or all notifications read for the current user
//   - getActivityLog(): paginated, with type filter (all/alerts/approvals/bookings)
//     matching the Screen 10 mockup filter tabs exactly
//
// Socket.io upgrade is documented as a stretch innovation item — polling every
// 8-10s is the baseline implementation. Keep this service independent of the
// transport so upgrading to push is just a change in the route layer.
