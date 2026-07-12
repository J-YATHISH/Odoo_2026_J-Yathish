import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './prisma/client';
import { globalErrorHandler } from './middleware/errorHandler';

// ─── Module routers ───────────────────────────────────────────────────────────
import authRouter from './modules/auth/routes';
import organizationRouter from './modules/organization/routes';
import assetsRouter from './modules/assets/routes';
import allocationRouter from './modules/allocation/routes';
import bookingRouter from './modules/booking/routes';
import maintenanceRouter from './modules/maintenance/routes';
import auditRouter from './modules/audit/routes';
import reportsRouter from './modules/reports/routes';
import notificationsRouter from './modules/notifications/routes';

// ─── App configuration ────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// CORS — only the configured frontend origin is allowed.
// In development this is http://localhost:5173 (Vite default).
// We never use wildcard * in a real config — only .env.example documents it
// as a placeholder to explain what the variable does.
const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin 
  ? corsOrigin.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      // Allow configured origins or any local development origin
      if (
        allowedOrigins.includes(origin) || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Parse incoming JSON request bodies.
// 10mb limit is generous for this app — the largest payloads will be
// asset creation with optional metadata, never large binary data
// (photos go through Multer in a later build step, not through JSON).
app.use(express.json({ limit: '10mb' }));

// ─── Health check — must be registered before module routers ──────────────────
//
// This is a REAL database health check, not a hardcoded 200.
// It runs a lightweight SELECT 1 query so we know the connection pool is alive.
// If the DB is unreachable (wrong credentials, DB not running), this returns 500
// with details. The frontend Dashboard calls this on mount to verify connectivity.

app.get('/health', async (_req, res) => {
  try {
    // SELECT 1 is the lightest possible query — it costs nothing on the DB side
    // but exercises the full connection path: pool → TCP → postgres → response.
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Log the real error server-side so we can diagnose connection issues.
    // Only send a safe summary to the client.
    console.error('[Health] Database connection failed:', err);

    res.status(500).json({
      status: 'error',
      db: 'unreachable',
      message: 'Database ping failed. Check DATABASE_URL and ensure Postgres is running.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── Public routes ────────────────────────────────────────────────────────────
import { createOrganization } from './modules/auth/controller';
import { validate } from './middleware/validate';
import { createOrganizationSchema } from './modules/auth/types';

app.post('/organizations', validate(createOrganizationSchema), createOrganization);

// ─── Module routers ───────────────────────────────────────────────────────────
//
// Each module owns its own route prefix. Adding a new module = one line here.
// The actual routes, controllers, and services live entirely inside each module folder.

app.use('/auth', authRouter);
app.use('/organization', organizationRouter);
app.use('/assets', assetsRouter);
app.use('/allocations', allocationRouter);
app.use('/bookings', bookingRouter);
app.use('/maintenance', maintenanceRouter);
app.use('/audit', auditRouter);
app.use('/reports', reportsRouter);
app.use('/notifications', notificationsRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────
// Any request that didn't match a registered route lands here.
// Returns a consistent JSON 404, not Express's default HTML response.
app.use((_req, res) => {
  res.status(404).json({
    error: {
      message: 'The requested endpoint does not exist.',
      code: 'NOT_FOUND',
    },
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// Must be the LAST middleware registered — Express identifies it by the
// four-argument signature (err, req, res, next).
app.use(globalErrorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  AssetFlow backend running on http://localhost:${PORT}`);
  console.log(`  Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  CORS origin : ${corsOrigin ?? 'http://localhost:5173 (default)'}\n`);
});

export default app;
