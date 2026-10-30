import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

/**
 * Banco opcional.
 *
 * O modelo do template exigia `DATABASE_URL` no momento do import — o que
 * quebrava `next build` em qualquer ambiente sem Postgres (inclusive o do site,
 * que não usa banco para atender visitantes). Aqui a conexão é preguiçosa: só
 * existe quando é pedida e quando há URL configurada.
 */
const globalForDb = globalThis as typeof globalThis & {
  __opportunityPool?: Pool;
  __opportunityDb?: NodePgDatabase<Record<string, never>>;
};

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): NodePgDatabase<Record<string, never>> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');

  if (!globalForDb.__opportunityPool) {
    globalForDb.__opportunityPool = new Pool({ connectionString: databaseUrl });
  }
  if (!globalForDb.__opportunityDb) {
    globalForDb.__opportunityDb = drizzle(globalForDb.__opportunityPool);
  }
  return globalForDb.__opportunityDb;
}
