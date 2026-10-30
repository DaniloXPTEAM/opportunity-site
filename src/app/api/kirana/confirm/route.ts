import { NextRequest, NextResponse } from 'next/server';

import { KIRANA_COOKIE, KiranaUnavailable, kiranaConfig, kiranaFetch, visitorIp } from '@/lib/kirana';

/**
 * Confirmação de ação sensível (ex.: enviar solicitação de serviço).
 *
 * A Kirana só executa ação de escrita com aprovação explícita do visitante.
 * A aprovação nasce no navegador, mas quem repassa é este servidor — junto com
 * o id de sessão do cookie, para ninguém confirmar a ação de outra pessoa.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const config = kiranaConfig();
  if (!config) {
    return NextResponse.json(
      { error: { code: 'kirana_not_configured', message: 'Atendimento não configurado.' } },
      { status: 503 },
    );
  }

  const sessionId = req.cookies.get(KIRANA_COOKIE)?.value ?? '';
  if (!sessionId) {
    return NextResponse.json(
      { error: { code: 'no_session', message: 'Nenhuma conversa ativa.' } },
      { status: 409 },
    );
  }

  let body: { actionId?: unknown; approve?: unknown };
  try {
    body = (await req.json()) as { actionId?: unknown; approve?: unknown };
  } catch {
    return NextResponse.json({ error: { code: 'invalid_json' } }, { status: 400 });
  }

  const actionId = typeof body.actionId === 'string' ? body.actionId : '';
  if (!actionId) {
    return NextResponse.json({ error: { code: 'missing_action' } }, { status: 400 });
  }

  try {
    const upstream = await kiranaFetch(config, '/api/chat/confirm', {
      method: 'POST',
      body: JSON.stringify({ sessionId, actionId, approve: body.approve === true }),
      ip: visitorIp(req),
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: { code: 'upstream_error', message: 'Não foi possível concluir a ação.' } },
        { status: 502 },
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error instanceof KiranaUnavailable) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 503 });
    }
    return NextResponse.json({ error: { code: 'internal_error' } }, { status: 500 });
  }
}
