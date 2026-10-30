import { sql } from 'drizzle-orm';

import { getDb, hasDatabase } from '@/db';

/**
 * Saúde do site. Sem banco configurado, responde 200 com `database: "off"` —
 * o atendimento da Kirana não depende de Postgres. Se um dia houver banco, ele
 * é verificado de verdade.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDatabase()) {
    return Response.json(
      { ok: true, service: 'opportunity-site', database: 'off' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  try {
    await getDb().execute(sql`select 1`);
    return Response.json(
      { ok: true, service: 'opportunity-site', database: 'up' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ ok: false, service: 'opportunity-site', database: 'down' }, { status: 500 });
  }
}
