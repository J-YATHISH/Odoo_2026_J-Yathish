# AssetFlow — Server

Express + TypeScript + Prisma backend for the AssetFlow Enterprise Asset & Resource Management System.

---

## Folder Structure

```
server/
├── src/
│   ├── index.ts              ← App entry: Express setup, all routers mounted, server start
│   ├── modules/              ← One folder per feature domain
│   │   ├── auth/             ← Login, signup, JWT issuance
│   │   ├── organization/     ← Departments, categories, employee directory, role promotion
│   │   ├── assets/           ← Asset CRUD, auto-tagging, status lifecycle
│   │   ├── allocation/       ← Asset allocation, transfers between employees
│   │   ├── booking/          ← Shared resource booking with overlap prevention
│   │   ├── maintenance/      ← Maintenance request kanban workflow
│   │   ├── audit/            ← Periodic audit cycles, asset verification
│   │   ├── reports/          ← Analytics queries, CSV export
│   │   └── notifications/    ← Notification feed, activity log
│   │
│   │   Each module contains exactly four files:
│   │   ├── routes.ts         ← Register HTTP routes for this module only
│   │   ├── controller.ts     ← Read request, call service, write response (no business logic)
│   │   ├── service.ts        ← All business logic and database calls via Prisma
│   │   └── types.ts          ← TypeScript types/interfaces specific to this module
│   │
│   ├── middleware/
│   │   ├── auth.ts           ← requireAuth (verify JWT) + requireRole([...]) (RBAC check)
│   │   ├── validate.ts       ← Zod validation factory: validate(schema) → Express middleware
│   │   └── errorHandler.ts   ← Global error handler: AppError → JSON, crashes → logged + 500
│   │
│   ├── prisma/
│   │   └── client.ts         ← Singleton PrismaClient (one instance per process)
│   │
│   └── utils/
│       ├── constants.ts      ← Re-exported Prisma enums + HTTP codes + error code strings
│       └── AppError.ts       ← Typed error class with statusCode + machine-readable code
│
├── prisma/
│   ├── schema.prisma         ← Database schema — single source of truth
│   └── migrations/           ← Every migration committed to Git — never hand-edit the DB
│
├── .env.example              ← Template for required environment variables (no real values)
├── .gitignore
├── tsconfig.json             ← Strict mode on — no implicit any
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## What goes where — the rule

| Where | Put this |
|---|---|
| `routes.ts` | Route definitions only — which HTTP method, which path, which middleware chain, which controller handler |
| `controller.ts` | HTTP layer only — read `req`, call service, write `res`. No `if` chains, no DB calls |
| `service.ts` | All business rules and all Prisma calls. This is the brain of each module |
| `types.ts` | TypeScript interfaces and types used by this module's controller and service |
| `middleware/` | Cross-cutting concerns that apply to multiple modules (auth, validation, errors) |
| `utils/` | Pure helpers with no Express or Prisma dependency — constants, error class |

---

## How to run

### 1. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your real PostgreSQL connection string and JWT secret
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the initial database migration
```bash
npm run db:migrate
# When prompted for a migration name, enter: init
# This creates all tables in your Postgres database
```

### 4. Apply raw SQL constraints
The second migration (002_add_raw_constraints) is pre-written in
`prisma/migrations/002_add_raw_constraints/migration.sql`.
Run it with:
```bash
npm run db:migrate
```

### 5. Start the dev server
```bash
npm run dev
```
The server starts on `http://localhost:3001` (or whatever PORT you set in `.env`).

### 6. Verify it's working
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","db":"connected","timestamp":"..."}
```

---

## Required environment variables

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — see `.env.example` for format |
| `PORT` | Port the Express server listens on (default: 3001) |
| `JWT_SECRET` | Secret used to sign and verify JWTs — must be a strong random string |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `8h`, `1d`) |
| `CORS_ORIGIN` | The frontend origin allowed by CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | `development` enables Prisma query logging; `production` silences it |

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run lint` | Check for ESLint violations |
| `npm run lint:fix` | Auto-fix ESLint violations |
| `npm run format` | Auto-format all `.ts` files with Prettier |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:reset` | Reset the database and re-run all migrations (dev only) |

---

## Build status

| Module | Routes | Controller | Service | Status |
|---|---|---|---|---|
| Auth | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Organization | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Assets | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Allocation | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Booking | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Maintenance | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Audit | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Reports | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |
| Notifications | ✅ Registered | ✅ 501 placeholder | ⏳ TODO | Scaffold done, logic in Step 2 |

Middleware fully implemented and testable now:
- ✅ `requireAuth` — real JWT verification
- ✅ `requireRole([...])` — real RBAC enforcement
- ✅ `validate(schema)` — real Zod validation with field-level errors
- ✅ `globalErrorHandler` — consistent `{ error: { message, code } }` shape
- ✅ `/health` endpoint with real `SELECT 1` DB ping
