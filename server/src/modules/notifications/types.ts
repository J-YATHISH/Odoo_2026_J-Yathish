// ─── Notifications module type definitions ─────────────────────────────────────
//
// Types for the notification feed and activity log.
//
// TODO: Define in the Notifications build step:
//   - NotificationResponse (id, type, message, isRead, createdAt)
//   - ActivityLogEntry (action, entityType, entityId, createdAt, employee name)
//   - ActivityLogFilter (type: 'all' | 'alerts' | 'approvals' | 'bookings')
//     These filter tabs match the Screen 10 mockup exactly.
//
// IMPORTANT: Notifications and ActivityLog entries are ALWAYS written inside
// the same database transaction as the state change that triggers them.
// They are never bolted on separately — this is enforced in each module's service.
