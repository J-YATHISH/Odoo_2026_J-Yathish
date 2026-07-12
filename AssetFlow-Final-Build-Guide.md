# AssetFlow — Final Build Guide
### Enterprise Asset & Resource Management System — 6-Hour Hackathon Build (Definitive Version)

> This document replaces both prior drafts. It resolves the one real conflict between them (local-only Postgres vs. Supabase), keeps everything else that was already strong, and adds the gaps your mockups imply but your spec didn't fully lock down. Read Section 0 first — it's the one decision that changes your whole demo narrative.

---

## 0. The One Decision That Matters: Where Does Postgres Live?

Your two source docs disagree here, so resolve it explicitly before writing a line of code.

**The brief's own words:** *"emphasis on... local databases like MySQL and PostgreSQL"*, *"minimizing third-party dependencies,"* *"plan for offline or local solutions and don't rely entirely on internet connectivity or cloud-based tools."*

Straight Supabase (as in the second doc — Supabase Auth + Supabase Storage + Supabase-hosted Postgres) fails this on three counts at once:
1. It's a cloud BaaS, not a local database — direct hit against the "local database" and "don't rely on cloud tools" criteria.
2. Supabase Auth does your signup/login/session/reset-password for you. The spec explicitly grades **realistic, non-self-elevating account creation** — if a vendor SDK handles that, you can't defend the auth logic under Q&A because there isn't any auth logic; you configured someone else's.
3. It quietly reintroduces the "trendy tech without understanding it" risk the brief warns about — judges will ask "walk me through what happens when I hit login," and "Supabase handles it" is a worse answer than a shorter JWT flow you wrote yourself.

**What to actually do — the middle path:**
- **Use a Supabase (or Neon/Railway) *hosted Postgres instance* only as the connection string** — this solves the real pain point in doc 3 (five laptops, five local Postgres installs, merge conflicts on schema). Everyone points Prisma at one `DATABASE_URL`. That's it.
- **Do NOT use Supabase Auth, Supabase Storage, or Supabase's REST/realtime layer.** Write your own JWT + bcrypt auth (Section 5.1), your own Multer-to-disk file uploads (Section 5.6), your own Express REST API. This is the part being graded — own all of it.
- If your internet is reliable enough for a 6-hour hack, this gets you doc 3's team-collaboration convenience with none of doc 2's "everyone installs Postgres locally" friction, and zero exposure on the "cloud dependency" criterion — because the *database engine* is still Postgres and every business rule still lives in code you wrote.
- **If asked in the demo:** say exactly this — "Postgres is hosted for team convenience during the hackathon; every line of business logic — auth, validation, allocation conflict rules, booking overlap, RBAC — is ours, in Express, and would run identically against a laptop-local Postgres install." That sentence pre-empts the objection.

If you'd rather not explain that nuance live, default to **fully local Postgres** (doc 2's original plan) and skip this section — it's the zero-risk option. The hosted-connection-string version is only worth it if your team's local dev environments are actually a bottleneck.

---

## 1. How the Team Splits This

| Owner | Modules |
|---|---|
| Dev A — Backend/DB Lead | Schema, migrations, Auth, Allocation/Transfer, shared `transitionAssetStatus()` service |
| Dev B — Frontend Core | Login/Signup, Dashboard, Org Setup, Asset Directory |
| Dev C — Frontend Workflow | Allocation/Transfer UI, Booking calendar, Maintenance kanban |
| Dev D — Audit/Reports/Notifications | Audit cycles, Reports & Analytics, Notification feed, Activity Log |
| Dev E (if available) | Innovation module (pick one) + input-validation pass + demo rehearsal |

Every member commits under their own name, feature-branch → PR → merge to `main` every 45–60 min. "One member managing the repo" is explicitly called out as insufficient — every teammate needs real, visible commits.

### Git Rules
- Branch naming: `feat/allocation`, `feat/booking`, `feat/audit`, etc.
- Commit format: `[module] short description` (e.g. `[booking] add overlap exclude constraint`)
- No branch lives longer than ~1 hour before merging
- PR review is a one-line sanity check from any other teammate, not a formality to skip — costs 60 seconds, shows up as "team effort" in your commit graph

---

## 2. Tech Stack (Final)

| Layer | Choice | Why (tied to what's graded) |
|---|---|---|
| Frontend | **React (Vite) + TypeScript + Tailwind CSS** | TS catches state-machine bugs early (asset status logic is the riskiest part of this app); Tailwind = consistent UI fast |
| Forms/Validation | **React Hook Form + Zod**, same Zod schemas reused on the backend | One schema, one source of truth for valid data shapes — directly satisfies "robust input validation" |
| Data fetching | **React Query** | Thin, well-understood cache layer — every member should be able to explain it in one sentence: cache + refetch, nothing more |
| State (UI-only) | **React Context** | One state library, not two — simpler to fully understand and defend live |
| Backend | **Node.js + Express + TypeScript** | Express over NestJS: NestJS's DI/decorator magic is hard to *explain* under Q&A; Express + a disciplined folder structure gives the same modularity without hidden framework behavior |
| ORM | **Prisma** | Type-safe schema, fast migrations, and the schema file itself is a readable artifact you can show judges directly |
| Database | **PostgreSQL** (local, or hosted connection string per Section 0) | Explicitly favored by the brief; relational fits this FK-heavy domain; supports the `EXCLUDE` constraint below |
| Auth | **JWT (self-implemented) + bcrypt** | You own and can explain every line — no Auth0/Clerk/Firebase/Supabase Auth |
| File uploads | **Multer to local disk** (`/uploads`) | No S3/MinIO/Supabase Storage — fully explainable, works offline |
| Background/scheduled checks | **`node-cron`, in-process** | No Redis/BullMQ — overdue detection computed on-read or on a lightweight interval; a queue is overkill at hackathon scale |
| Realtime notifications | **Polling every 8–10s for MVP.** Socket.io is a documented stretch item only | Keeps core deps minimal; add realtime once the core is solid, don't depend on it |
| QR codes | **`qrcode`** (generate) **+ `html5-qrcode`** (scan) — Innovation Module only | Small, single-purpose libraries, not a platform dependency |
| Charts | **Recharts** | Lightweight, well documented, used only in Reports |
| Testing (stretch) | **Vitest**, 3–4 business-rule unit tests (allocation conflict, booking overlap, state transitions) | Cheap to add, strong signal for "debugging skills" / "coding standards" |

**Deliberately excluded, and why:**
- NestJS, Redis, BullMQ, S3/MinIO, Meilisearch, Sentry, Supabase Auth/Storage/Realtime — real infra, wrong tool for a 6-hour build; each is one more black box you'd have to explain without fully owning.
- Any trained ML model, any LLM/Claude API call — a model trained on synthetic seed data you invented isn't defensible under "how did you validate this?"; an LLM call is an external network dependency the brief explicitly discourages. Replaced by transparent weighted-formula versions (Section 9).
- Zustand — one state tool (Context) is enough to master and defend.

---

## 3. High-Level Architecture

```
React (Vite + TS) Frontend
  - Role-based routing
  - React Query (server cache)
  - AuthContext, NotifyContext
        |
        | REST JSON, JWT in Authorization header
        v
Express (TS) Backend
  routes -> controllers -> services -> Prisma Client
  middleware: auth, role-guard, zod-validate, error handler
        |
        | Prisma ORM
        v
PostgreSQL
  EXCLUDE constraint on Booking
  partial unique index on active Allocation
```

**Backend folders:**
```
/server/src
  /modules
    /auth
    /organization      (departments, categories, employees)
    /assets
    /allocation
    /booking
    /maintenance
    /audit
    /reports
    /notifications
    /innovation         (ghost-asset, marketplace, qr, health-score - isolated, optional)
  /middleware
  /prisma/schema.prisma
  /utils
```

**Frontend folders:**
```
/client/src
  /pages          (one per screen)
  /components     (Sidebar, KPICard, StatusBadge, DataTable, Modal - built once, reused everywhere)
  /context
  /api            (one file per module)
  /hooks
```

**Why this earns "logic and modularity" points:** each backend module owns its routes/controller/service/types end-to-end. A reviewer opens `/modules/booking` and understands booking without touching anything else. The Innovation module is physically isolated so it never risks breaking the graded core.

---

## 4. Development Timeline (6 Hours)

| Time | Milestone |
|---|---|
| 0:00–0:20 | Repo init, Prisma schema + migration, DB connection agreed (Section 0), branch strategy set |
| 0:20–1:00 | Auth (signup=Employee only, login, JWT, role middleware, password-strength check) |
| 1:00–1:30 | Organization Setup (departments, categories, employee directory + promote flow) |
| 1:30–2:20 | Asset Registration & Directory (CRUD, auto-tag, status lifecycle service) |
| 2:20–3:20 | **Allocation & Transfer** (conflict block + transfer workflow) — signature feature, protect this slot |
| 3:20–4:10 | Resource Booking (DB-level overlap constraint + calendar UI) |
| 4:10–4:50 | Maintenance kanban workflow |
| 4:50–5:20 | Dashboard KPIs + Notifications + Activity Log |
| 5:20–5:45 | Reports & Analytics (real aggregate queries) |
| 5:45–6:00 | Seed realistic demo data, rehearse demo script, README, final polish |

**Cut list if behind (in this order):** Audit module → Reports charts (keep raw numbers, drop Recharts polish) → Notification UI (keep DB writes, skip pretty feed) → Department hierarchy (flatten to one level).

**Never cut:** Auth, Asset CRUD, Allocation conflict logic, Booking overlap logic — these prove you can model real business rules, which is what's actually being graded.

**If core finishes early:** move to Section 9 (Innovation Module) — pick **one**, not all.

---

## 5. Database Schema (PostgreSQL via Prisma)

```prisma
enum Role {
  ADMIN
  ASSET_MANAGER
  DEPARTMENT_HEAD
  EMPLOYEE
}

enum AssetStatus {
  AVAILABLE
  ALLOCATED
  RESERVED
  UNDER_MAINTENANCE
  LOST
  RETIRED
  DISPOSED
}

enum TransferStatus {
  REQUESTED
  APPROVED
  REJECTED
  COMPLETED
}

enum BookingStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MaintenanceStatus {
  PENDING
  APPROVED
  REJECTED
  TECHNICIAN_ASSIGNED
  IN_PROGRESS
  RESOLVED
}

enum AuditVerification {
  VERIFIED
  MISSING
  DAMAGED
}

enum Status {
  ACTIVE
  INACTIVE
}

model Department {
  id        Int          @id @default(autoincrement())
  name      String       @unique
  headId    Int?
  head      Employee?    @relation("DepartmentHead", fields: [headId], references: [id])
  parentId  Int?
  parent    Department?  @relation("DeptHierarchy", fields: [parentId], references: [id])
  children  Department[] @relation("DeptHierarchy")
  status    Status       @default(ACTIVE)
  employees Employee[]   @relation("EmployeeDept")
  createdAt DateTime     @default(now())
}

model AssetCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  extraFields Json?    // e.g. { "warrantyPeriodMonths": 24 } - avoids a migration per category
  assets      Asset[]
}

model Employee {
  id           Int          @id @default(autoincrement())
  name         String
  email        String       @unique
  passwordHash String
  role         Role         @default(EMPLOYEE)
  departmentId Int?
  department   Department?  @relation("EmployeeDept", fields: [departmentId], references: [id])
  status       Status       @default(ACTIVE)
  headOf       Department[] @relation("DepartmentHead")
  createdAt    DateTime     @default(now())

  allocationsHeld   Allocation[]         @relation("CurrentHolder")
  transfersFrom     TransferRequest[]    @relation("TransferFrom")
  transfersTo       TransferRequest[]    @relation("TransferTo")
  bookingsMade      Booking[]
  maintenanceRaised MaintenanceRequest[] @relation("RaisedBy")
  auditsAssigned    AuditCycleAuditor[]
  notifications     Notification[]
  activityLogs      ActivityLog[]
}

model Asset {
  id              Int           @id @default(autoincrement())
  tag             String        @unique   // AF-0001, server-generated inside a transaction
  name            String
  categoryId      Int
  category        AssetCategory @relation(fields: [categoryId], references: [id])
  serialNumber    String?       @unique
  acquisitionDate DateTime?
  acquisitionCost Decimal?
  condition       String        @default("Good")
  location        String?
  isBookable      Boolean       @default(false)
  isLendable      Boolean       @default(false)   // innovation: marketplace flag
  photoUrl        String?
  qrPayload       String?       @unique           // innovation: QR audit sync
  status          AssetStatus   @default(AVAILABLE)
  lastActivityAt  DateTime      @default(now())   // innovation: ghost-asset detection
  createdAt       DateTime      @default(now())

  allocations     Allocation[]
  bookings        Booking[]
  maintenanceReqs MaintenanceRequest[]
  auditItems      AuditItem[]
}

model Allocation {
  id                 Int       @id @default(autoincrement())
  assetId            Int
  asset              Asset     @relation(fields: [assetId], references: [id])
  holderId           Int
  holder             Employee  @relation("CurrentHolder", fields: [holderId], references: [id])
  allocatedAt        DateTime  @default(now())
  expectedReturnDate DateTime?
  returnedAt         DateTime?
  conditionAtReturn  String?
  isActive           Boolean   @default(true)
  transferRequests   TransferRequest[]

  // Enforced in Postgres, not just app code:
  // CREATE UNIQUE INDEX one_active_allocation_per_asset
  //   ON "Allocation" ("assetId") WHERE "isActive" = true;
}

model TransferRequest {
  id           Int            @id @default(autoincrement())
  allocationId Int
  allocation   Allocation     @relation(fields: [allocationId], references: [id])
  fromId       Int
  from         Employee       @relation("TransferFrom", fields: [fromId], references: [id])
  toId         Int
  to           Employee       @relation("TransferTo", fields: [toId], references: [id])
  reason       String?
  status       TransferStatus @default(REQUESTED)
  isCrossDept  Boolean        @default(false)   // innovation: marketplace-originated transfer
  requestedAt  DateTime       @default(now())
  resolvedAt   DateTime?
}

model Booking {
  id         Int           @id @default(autoincrement())
  assetId    Int
  asset      Asset         @relation(fields: [assetId], references: [id])
  bookedById Int
  bookedBy   Employee      @relation(fields: [bookedById], references: [id])
  startTime  DateTime
  endTime    DateTime
  status     BookingStatus @default(UPCOMING)
  createdAt  DateTime      @default(now())

  @@index([assetId, startTime, endTime])

  // Postgres-level guarantee against overlap races (raw SQL migration —
  // Prisma doesn't model EXCLUDE constraints natively):
  //
  // ALTER TABLE "Booking" ADD CONSTRAINT no_overlapping_bookings
  //   EXCLUDE USING gist (
  //     "assetId" WITH =,
  //     tstzrange("startTime", "endTime") WITH &&
  //   ) WHERE (status IN ('UPCOMING','ONGOING'));
  //
  // The single strongest "we understand databases" line in the project -
  // demo it explicitly: even a bug in app-layer validation cannot create an overlap.
}

model MaintenanceRequest {
  id               Int               @id @default(autoincrement())
  assetId          Int
  asset            Asset             @relation(fields: [assetId], references: [id])
  raisedById       Int
  raisedBy         Employee          @relation("RaisedBy", fields: [raisedById], references: [id])
  issueDescription String
  priority         String            @default("Medium")
  photoUrl         String?
  status           MaintenanceStatus @default(PENDING)
  technicianName   String?
  createdAt        DateTime          @default(now())
  resolvedAt       DateTime?
}

model AuditCycle {
  id        Int                 @id @default(autoincrement())
  scopeDept Int?
  scopeLoc  String?
  startDate DateTime
  endDate   DateTime
  closed    Boolean             @default(false)
  auditors  AuditCycleAuditor[]
  items     AuditItem[]
  createdAt DateTime            @default(now())
}

model AuditCycleAuditor {
  id           Int        @id @default(autoincrement())
  auditCycleId Int
  auditCycle   AuditCycle @relation(fields: [auditCycleId], references: [id])
  employeeId   Int
  employee     Employee   @relation(fields: [employeeId], references: [id])
}

model AuditItem {
  id           Int                @id @default(autoincrement())
  auditCycleId Int
  auditCycle   AuditCycle         @relation(fields: [auditCycleId], references: [id])
  assetId      Int
  asset        Asset              @relation(fields: [assetId], references: [id])
  verification AuditVerification?
  notes        String?
}

model Notification {
  id         Int      @id @default(autoincrement())
  employeeId Int
  employee   Employee @relation(fields: [employeeId], references: [id])
  type       String
  message    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model ActivityLog {
  id         Int      @id @default(autoincrement())
  employeeId Int
  employee   Employee @relation(fields: [employeeId], references: [id])
  action     String
  entityType String
  entityId   Int?
  createdAt  DateTime @default(now())
}
```

### Why these specific choices matter (say this in the demo)
- **`Allocation.isActive` + partial unique index** — Postgres itself refuses two active allocations on one asset, even under concurrent requests. Not just an `if` check in Express.
- **`Booking` `EXCLUDE` constraint using `tstzrange` + GiST** — the database, not application code, is the final authority against overlap races. Cite this directly to judges.
- **`Asset.status` is never written directly by any route.** Every module calls one shared `transitionAssetStatus(assetId, newStatus)` service function, so the valid-transition table lives in exactly one place.
- **`extraFields` JSONB on category** avoids a schema migration every time someone wants a category-specific field — a deliberate, explainable use of Postgres's semi-structured support instead of over-normalizing under time pressure.

### Migrations, team-shared DB
Whether Postgres is local or hosted (Section 0), never hand-edit the schema live:
```
/prisma/migrations/
  001_init/
  002_add_qr_payload/
  003_add_booking_exclude_constraint/
```
Commit every migration to Git. Whoever pulls latest runs `prisma migrate dev` — schema drift never happens silently. This is what makes "everyone shares one DB" safe instead of the "Member B accidentally drops a table" failure mode doc 3 itself warned about.

---

## 6. Module-by-Module Feature Definitions

### 6.1 Auth
- `POST /auth/signup` → Employee only, role never accepted from client — validated server-side even if the request body is tampered with
- `POST /auth/login` → bcrypt compare → JWT (id, role, deptId, 8h expiry)
- `POST /auth/forgot-password` → demo mode: show reset token on screen; say plainly in the README that real SMTP delivery is a "given more time" item — don't fake it
- Middleware: `requireAuth`, `requireRole([...])` on every protected route
- **In-module innovation:** client + server password-strength check, zero dependency, regex-based (your Screen 1 mockup has room for this under the password field)

### 6.2 Organization Setup (Admin only)
- Departments: CRUD, self-referencing `parentId`, block deactivating a department with active employees
- Categories: CRUD + `extraFields` key-value editor
- Employee Directory: search/filter; the **promote** action is the only place role changes happen — enforced by a role-guard on that single endpoint, matching your spec's "this is the only place roles are assigned"

### 6.3 Asset Registration & Directory
- Auto-tag `AF-####` generated inside a DB transaction (prevents duplicate tags on concurrent creates — a real correctness detail, mention it)
- Search via Postgres `ILIKE` across tag/serial/name — no external search engine needed (matches your Screen 4 search bar)
- All status changes go through `transitionAssetStatus()`:
```
AVAILABLE          -> ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, RETIRED
ALLOCATED          -> AVAILABLE (return), LOST
RESERVED           -> AVAILABLE, ALLOCATED
UNDER_MAINTENANCE  -> AVAILABLE, RETIRED
LOST               -> RETIRED
RETIRED            -> DISPOSED
```

### 6.4 Allocation & Transfer — *signature feature*
- `POST /allocations` → checks active allocation; if one exists, `409` + `{ currentHolder }` so the frontend shows "currently held by X" + Transfer Request CTA — exactly what your Screen 5 mockup already shows
- `POST /transfer-requests` → REQUESTED
- `PATCH /transfer-requests/:id/approve` (Asset Manager/Dept Head) → single transaction: deactivate old allocation, create new one, mark transfer COMPLETED, write ActivityLog + Notification
- `PATCH /allocations/:id/return` → condition notes, `transitionAssetStatus(AVAILABLE)`
- Overdue: computed on-read (`expectedReturnDate < now()`) — simpler and just as correct as a cron job at hackathon scale
- **In-module innovation (Smart Transfer Matching):** on the 409 response, also return up to 3 other `AVAILABLE` assets in the same category as one-click alternatives

### 6.5 Resource Booking
- Overlap enforced twice: app-level pre-check (fast user feedback) **and** the DB `EXCLUDE` constraint (final guarantee) — demoing the DB catching a race the app layer missed is a strong technical moment, and matches your Screen 6 mockup's rejected-overlap example exactly
- App-level check query:
```sql
SELECT * FROM "Booking"
WHERE "assetId" = $1 AND status IN ('UPCOMING','ONGOING')
  AND "startTime" < $3 AND "endTime" > $2;
```
- Calendar view: simple day-grid built from the bookings list — no calendar library, fully owned code
- **In-module innovation (Auto-Suggestion):** on rejection, compute and show the next 2–3 open gaps for that resource

### 6.6 Maintenance Management
- Kanban states matching your Screen 7 mockup: Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved
- `APPROVED` → `transitionAssetStatus(UNDER_MAINTENANCE)`; `RESOLVED` → `transitionAssetStatus(AVAILABLE)`
- Photo via Multer → `/uploads/maintenance/`
- **In-module innovation:** keyword-based priority auto-suggestion — description containing "broken"/"not working"/"urgent" defaults priority to High (say plainly: a keyword rule, not ML)

### 6.7 Asset Audit
- Create cycle (scope + dates + auditors) → auto-generate `AuditItem` rows for in-scope assets, matching your Screen 8 mockup
- Auditor marks Verified/Missing/Damaged
- `POST /audit-cycles/:id/close` → transaction: every MISSING item → `transitionAssetStatus(LOST)`; discrepancy list is a filtered query, no extra table needed

### 6.8 Reports & Analytics
- Everything computed live via Prisma aggregate queries at request time — satisfies "dynamic data, not static JSON" directly:
  - Utilization by department (active allocations grouped by dept)
  - Maintenance frequency by asset/category
  - Idle assets (no booking/allocation in N days)
  - Assets due for maintenance / nearing retirement
  - CSV export built server-side from the same query

### 6.9 Notifications & Activity Log
- Every state-changing action writes `Notification` + `ActivityLog` inside the *same* transaction as the state change — never bolted on separately
- Frontend polls `GET /notifications?unread=true` every 8–10s (Socket.io upgrade documented as innovation stretch only)
- Your Screen 10 mockup shows filter tabs (**All / Alerts / Approvals / Bookings**) — build `GET /activity-log?type=` to back these as real filters, not just UI decoration

---

## 7. Input Validation (Must-Have, Don't Skip Under Pressure)

Every mutating endpoint has a Zod schema:
```ts
const createAssetSchema = z.object({
  name: z.string().min(2).max(100),
  categoryId: z.number().int().positive(),
  serialNumber: z.string().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  isBookable: z.boolean().default(false),
});
```
Validation middleware returns field-level errors:
```json
{ "errors": { "name": "Name must be at least 2 characters" } }
```
Render this inline under each field — never a raw `alert()`. This is graded explicitly ("robust input validation... clear feedback").

**Also validate at the database level, not just the API:** `@unique` constraints (email, tag, serialNumber, qrPayload), the partial unique index on `Allocation`, and the `EXCLUDE` constraint on `Booking` are all defense-in-depth — even a bug in your Zod schema or a bypassed frontend can't corrupt state. Mention this pairing explicitly; "validation at two layers" is a stronger answer than either alone.

---

## 8. UI/UX Consistency Rules

- One Tailwind config, 5–6 CSS variables (primary/success/warning/danger/neutral-bg/neutral-text) matching the dark theme already in your mockups
- One shared `<Sidebar>` reused on every screen — your mockups already show an identical left-nav across all 10 screens, build it once
- Shared `<KPICard>`, `<StatusBadge>`, `<DataTable>`, `<Modal>` components reused everywhere
- Loading and empty states on every list — never a blank screen mid-demo
- Your mockups are already consistent (same sidebar, same header bar, same color language across all 10 screens) — that's a genuine strength, protect it. Don't let time pressure introduce a screen that looks like it came from a different app.

---

## 9. Innovation — Embedded In Modules (do these first if time allows)

| Module | Feature | Effort |
|---|---|---|
| Allocation | Smart Transfer Matching (suggest same-category available assets on conflict) | Low |
| Booking | Auto-suggest next open slot on overlap rejection | Low |
| Maintenance | Keyword-based priority auto-suggestion | Low |
| Audit | Flag assets unverified across 2+ consecutive cycles as "audit risk" | Low |
| Assets | **Ghost Asset Detection** — flag `AVAILABLE` assets with `lastActivityAt` older than 60 days on the Dashboard | Low |
| Assets | **Asset Health Score** (0–100, color-coded) — transparent weighted formula: `score = 100 - (w1*ageInYears + w2*maintenanceCount - w3*conditionBonus)`, clamped 0–100, weights configurable in Settings | Low–Medium |

These are cheap, explainable, and directly reuse data the app already generates.

---

## 10. Separate Innovation Module ("If Time Permits" — Build Only After Sections 1–9 Are Fully Working)

Isolated in `/modules/innovation` so it never risks the graded core. Pick **one**, not all — build one well rather than three half-finished.

### Option A — Cross-Department Asset Marketplace (highest originality)
- `Asset.isLendable` flag settable by a Department Head on a surplus asset
- New Marketplace screen: `GET /marketplace` lists all lendable assets across departments
- Borrow request reuses the existing `TransferRequest` model with `isCrossDept: true` — no new workflow engine needed
- **Why it's worth it:** most asset trackers handle one department's inventory in isolation; formalizing inter-department lending as a first-class flow is a genuine, defensible differentiator.

### Option B — QR-Based Physical-Digital Audit Sync (best live-demo visual moment)
- Generate a QR code (`qrcode` npm package, client-side, zero backend cost) encoding each asset's `tag` at registration time, stored in `Asset.qrPayload`
- During an active Audit Cycle, scan with `html5-qrcode` (in-browser camera) → routes straight to that asset's Verified/Missing/Damaged panel, skipping manual search
- **Demo-safe fallback required:** manual tag entry field if camera access fails live — always have this ready, camera demos are the single highest-risk live-demo failure point

### Option C — Realtime Layer Upgrade
- Swap notification/dashboard polling for **Socket.io** so KPIs and the notification feed push live without refresh
- The smallest, safest "trendy tech used meaningfully" addition — a small, well-understood library, directly answers "use trendy tech only if it adds real value"

### Explicitly not recommended for a 6-hour build (future-roadmap notes only)
- Any trained ML model — the weighted-formula Health Score gives the same user-facing value without needing defensible training data you don't have
- Any LLM/Claude API report assistant — external network dependency, against the brief's own guidance
- Redis/BullMQ, S3, a separate Python microservice, Supabase Auth/Storage — real infra for a real product roadmap, wrong tool today

---

## 11. Security Checklist (Quick Pass, ~15 Minutes, High Payoff)

The brief lists **security** as a standalone grading criterion — these are the highest-value-per-minute items:
- Hash passwords with bcrypt (cost factor 10–12), never store plaintext, never log them
- JWT secret in `.env`, never committed; `.env` in `.gitignore` from commit #1
- Every protected route runs through `requireAuth` + `requireRole` — no route trusts a role claimed by the frontend alone
- Re-validate role server-side on signup even if the request body includes a `role` field (assume it's tampered with)
- Basic rate-limit on `/auth/login` (a 5-line `express-rate-limit` middleware) — cheap, and directly answers "did you think about brute-force login attempts?"
- File upload validation on Multer: restrict MIME type and size for photos, don't trust the client-sent extension

---

## 12. Demo Script (5–7 min — Rehearse This Exact Sequence)

1. Login as Admin → KPI dashboard (10s)
2. Org Setup: promote an employee to Asset Manager live (30s)
3. Register a new asset, show auto-tag generation (20s)
4. **Allocate it, then attempt to allocate it again as a different user → conflict block + Smart Transfer Matching suggestions + Transfer Request flow** (signature moment — 60s)
5. Book a shared resource, then attempt an overlapping booking → rejection + auto-suggested alternative slot (40s)
6. Raise a maintenance request → approve it → watch the asset flip to Under Maintenance live (40s)
7. Reports screen with real numbers reflecting everything just done (20s)
8. Innovation module demo, if built (30–45s)
9. Close line: *"Postgres + Prisma + Express + React, zero third-party SaaS dependencies for auth or storage, DB-level constraints backing up app-level validation, full RBAC, full input validation."*

Every member narrates the module they personally built — presentation participation is explicitly graded.

---

## 13. Final Pre-Submission Checklist

Map this straight to the stated evaluation criteria:

| Criterion | What proves it in your build |
|---|---|
| Database design (highly valued) | Prisma schema shown live, partial unique index + EXCLUDE constraint explained |
| Backend API design | Modular `/routes → controllers → services` per feature, one shared `transitionAssetStatus()` |
| Real-time/dynamic data | Reports computed live via aggregate queries; polling notifications; no hardcoded JSON in the demo |
| Robust input validation | Zod on every mutating endpoint + DB constraints as a second layer |
| Git as a team effort | Feature branches, commit history showing all members, no single-owner repo |
| Clean, consistent UI | One sidebar, one Tailwind theme, shared components — your mockups already nail this, just build to them faithfully |
| Minimizing third-party dependencies | Self-written auth/uploads/validation; hosted DB connection string is the only exception, and it's justified in Section 0 |
| Meaningful trendy tech | One innovation item, chosen and explained, not three half-built gimmicks |
| Team presentation | Each member demos their own module in Section 12's script |
| Understanding your tools | Be ready to explain, in one sentence each: what React Query does, what the EXCLUDE constraint does, what JWT actually contains |

**README must include:** setup steps (env vars, migration command, seed command), architecture diagram (Section 3), and an honest "what we'd do with more time" list (forgot-password email delivery, Socket.io everywhere, the two innovation options you didn't build). Judges read intent as clearly as code — an honest scope note is worth more than pretending everything's finished.
