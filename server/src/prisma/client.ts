import { PrismaClient } from '@prisma/client';

// A singleton PrismaClient instance shared across the entire backend.
// Prisma's own recommendation: one client per process to avoid exhausting
// the connection pool. In development, the query log is enabled so you can
// see every SQL statement the ORM generates — useful for catching N+1 issues
// before they reach production.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

export default prisma;
