-- AssetFlow — Migration 002: Raw SQL Constraints
-- ─────────────────────────────────────────────────────────────────────────────
--
-- WHY THIS FILE EXISTS AS A SEPARATE MIGRATION:
-- Prisma can model most constraints in schema.prisma, but two specific
-- PostgreSQL features are outside Prisma's schema language:
--   1. Partial unique indexes (unique only when a condition is true)
--   2. EXCLUDE constraints using GiST index operators
--
-- These are added here as plain SQL so they are tracked in Git alongside
-- every other schema change, run automatically with `prisma migrate dev`,
-- and never applied by hand (which would cause schema drift).
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── CONSTRAINT 1: One active allocation per asset ───────────────────────────
--
-- What this prevents in plain English:
--   The partial unique index below makes it impossible for Postgres to store
--   two Allocation rows for the same asset where both have isActive = true.
--   This enforces the business rule "an asset can only be held by one person
--   at a time" at the database level — not just in application code.
--   Even if there is a bug in the Express service layer, or two concurrent
--   API requests race to allocate the same asset at the exact same millisecond,
--   Postgres will reject the second INSERT with a unique constraint violation.
--   The application catches that violation and returns a 409 Conflict to the
--   client, showing who the current holder is and suggesting alternatives.
--   Without this constraint, a race condition between two concurrent requests
--   could silently create two active allocations — a data integrity failure
--   that would be very hard to detect and recover from later.

CREATE UNIQUE INDEX one_active_allocation_per_asset
  ON "Allocation" ("assetId")
  WHERE "isActive" = true;


-- ─── CONSTRAINT 2: No overlapping bookings on the same asset ─────────────────
--
-- What this prevents in plain English:
--   This EXCLUDE constraint uses a GiST (Generalized Search Tree) index to
--   guarantee that no two Booking rows can exist for the same asset with
--   overlapping time ranges when either booking is UPCOMING or ONGOING.
--   The tstzrange() function turns the startTime and endTime columns into a
--   time range, and the && operator tests whether two ranges overlap.
--   The WHERE clause scopes the constraint to only active bookings — COMPLETED
--   and CANCELLED bookings are excluded so historical data is preserved.
--
--   The application already does an app-level overlap check before inserting
--   a booking (fast user feedback), but that check has a race condition:
--   two requests can both read "no conflict" and then both try to insert.
--   This database constraint is the final backstop — it catches the race
--   even if the application check is bypassed or two requests execute
--   simultaneously. Only one insert will succeed; the other gets a
--   constraint violation that the service translates into a 409 response
--   with suggested alternative time slots for the user.
--
-- Requires the btree_gist extension because "assetId" is an integer (btree type)
-- and combining it with a range type in EXCLUDE requires the extension.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    "assetId" WITH =,
    tstzrange("startTime", "endTime", '[)') WITH &&
  )
  WHERE (status IN ('UPCOMING', 'ONGOING'));
