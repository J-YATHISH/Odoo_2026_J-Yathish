# AssetFlow

**Enterprise Asset & Resource Management System**

> A full-stack web application for managing physical assets, tracking allocations,
> scheduling resource bookings, and running audit cycles — built with
> Node.js + Express + TypeScript + Prisma + PostgreSQL on the backend
> and React + Vite + TypeScript + Tailwind CSS on the frontend.

---

## Project Structure

```
assetflow/
├── server/    ← Express + TypeScript + Prisma backend
└── client/    ← React + Vite + TypeScript + Tailwind frontend (Step 2)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local install or hosted connection string)
- npm 9+

---

### Backend (Step 1 — available now)

```bash
# 1. Go into the server folder
cd server

# 2. Copy the environment template and fill in your values
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run the initial database migration (creates all tables)
npm run db:migrate
# When prompted: enter "init" as the migration name

# 5. Start the development server
npm run dev
```

The API will be running at **http://localhost:3001**

**Verify the database connection:**
```bash
curl http://localhost:3001/health
# {"status":"ok","db":"connected","timestamp":"..."}
```

---

### Frontend (Step 2 — available now)

```bash
# 1. Go into the client folder
cd client

# 2. Copy the environment template and fill in your values
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The UI will be running at **http://localhost:5173**

---

## Required Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/assetflow` |
| `PORT` | API server port | `3001` |
| `JWT_SECRET` | Strong random string for signing JWTs | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime | `8h` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend (`client/.env`) — Step 2

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3001` |

---

## Database Migrations

All migrations live in `server/prisma/migrations/` and are tracked in Git.

| Migration | What it does |
|---|---|
| `001_init` | Creates all tables from the Prisma schema |
| `002_add_raw_constraints` | Adds partial unique index (one active allocation per asset) + GiST EXCLUDE constraint (no overlapping bookings) |

To run all pending migrations:
```bash
cd server
npm run db:migrate
```

To reset the database entirely (dev only):
```bash
cd server
npm run db:reset
```

---

## Architecture

```
React (Vite + TS) Frontend
  - Role-based routing
  - AuthContext (JWT in memory, never localStorage)
  - API layer (one file per module, typed error shapes)
        |
        | REST JSON, JWT in Authorization header
        v
Express (TS) Backend
  routes → controllers → services → Prisma Client
  middleware: requireAuth, requireRole, validate(zod), globalErrorHandler
        |
        | Prisma ORM
        v
PostgreSQL
  - EXCLUDE constraint on Booking (no overlapping time ranges)
  - Partial unique index on Allocation (one active allocation per asset)
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend framework | Express + TypeScript | Explicit, fully explainable — no DI magic |
| ORM | Prisma | Type-safe, readable schema file, clean migrations |
| Database | PostgreSQL | Relational, supports GiST EXCLUDE constraint |
| Auth | JWT + bcrypt (self-implemented) | Own every line — no Auth0 / Supabase Auth |
| Validation | Zod (shared schemas) | One schema, used on both backend and frontend |
| Frontend | React + Vite + TypeScript | Fast dev server, strict typing |
| Styling | Tailwind CSS | Consistent design system, one config |
| Data fetching | React Query | Cache + refetch, simple to explain |

---

## What's intentionally deferred (honest scope notes)

- `/auth/signup` and `/auth/login` return 501 until the Auth build step (Step 2)
- All module controllers return 501 — business logic comes module by module
- Forgot-password email delivery — demo shows token on screen; real SMTP needs more time
- Socket.io realtime notifications — polling every 8-10s is the baseline; Socket.io is a documented stretch goal
- AI/ML prediction layer — planned after the full system is working:
  - Predictive maintenance (when will this asset next need repair?)
  - Resource demand forecasting (seasonal booking pattern prediction)
  - Anomaly detection (unusual allocation patterns)
  - These will be a separate service consuming data from the live system
