import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 requires an explicit driver adapter instead of an implicit
// engine + datasource url. See prisma/schema.prisma and prisma.config.ts.
//
// `max` is kept small on purpose: in serverless (Vercel), each warm function
// instance holds its own pool, and DATABASE_URL points at Supabase's
// Transaction pooler (PgBouncer), which already does the real pooling. A
// large `max` here just multiplies connections across instances and can
// exhaust the pooler.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

// Cached on globalThis in every environment (not just dev): in serverless,
// this lets a warm function instance reuse the same client/pool across
// invocations instead of opening a fresh pool on every request.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
