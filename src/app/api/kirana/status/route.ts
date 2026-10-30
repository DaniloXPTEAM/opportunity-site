import { NextResponse } from 'next/server';

import { kiranaConfig, kiranaFetch } from '@/lib/kirana';

/**
 * Estado do atendimento, para a interface não mostrar um "online" decorativo.
 *
 * Devolve somente um booleano: nada de URL interna, versão de modelo, nome de
 * Gateway ou chave. Se a Kirana não estiver configurada, o site assume o modo
 * de contato humano.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const config = kiranaConfig();
  if (!config) return NextResponse.json({ available: false, reason: 'not_configured' });

  try {
    const res = await kiranaFetch(config, '/api/status', { method: 'GET' });
    if (!res.ok) return NextResponse.json({ available: false, reason: 'unhealthy' });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return NextResponse.json(
      { available: data?.ok !== false },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ available: false, reason: 'unreachable' });
  }
}
