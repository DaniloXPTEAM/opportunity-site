import { NextRequest, NextResponse } from 'next/server';

import {
  KIRANA_COOKIE,
  type KiranaConfig,
  KiranaUnavailable,
  kiranaConfig,
  kiranaFetch,
  sectionToSitePath,
  visitorIp,
} from '@/lib/kirana';

/**
 * Atendimento real: repassa a mensagem do visitante para a Kirana v0.5.3 e
 * devolve o stream SSE dela. A Kirana continua decidindo tudo (modelo,
 * ferramentas, memória); esta rota só protege e transporta.
 *
 * O que esta rota NÃO faz: responder com texto próprio. Se a Kirana estiver
 * fora do ar, devolve 503 — a interface assume isso e oferece contato humano,
 * em vez de inventar uma resposta.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  message?: unknown;
  section?: unknown;
  sessionId?: unknown;
}

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  const config = kiranaConfig();
  if (!config) {
    return jsonError(
      'kirana_not_configured',
      'O atendimento inteligente não está configurado neste ambiente.',
      503,
    );
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return jsonError('invalid_json', 'Corpo da requisição inválido.', 400);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return jsonError('empty_message', 'Escreva uma mensagem.', 400);
  if (message.length > 4000) return jsonError('message_too_long', 'Mensagem muito longa.', 400);

  const { path, pageId } = sectionToSitePath(typeof body.section === 'string' ? body.section : null);
  const ip = visitorIp(req);

  try {
    // 1. Sessão: reutiliza a do cookie ou cria uma nova na Kirana.
    let sessionId =
      typeof body.sessionId === 'string' && body.sessionId
        ? body.sessionId
        : (req.cookies.get(KIRANA_COOKIE)?.value ?? '');
    let created = false;

    const exists = sessionId ? await sessionStillValid(config, sessionId, ip) : false;
    if (!exists) {
      const res = await kiranaFetch(config, '/api/session', {
        method: 'POST',
        body: JSON.stringify({ title: message.slice(0, 40) }),
        ip,
      });
      if (!res.ok) throw new KiranaUnavailable('Não foi possível abrir o atendimento.', 'session_failed');
      const data = (await res.json()) as { id?: string };
      if (!data?.id) throw new KiranaUnavailable('Sessão inválida.', 'session_failed');
      sessionId = data.id;
      created = true;
    }

    // 2. Turno do agente (streaming).
    const upstream = await kiranaFetch(config, '/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, siteId: config.siteId, path, pageId }),
      ip,
    });

    if (!upstream.ok || !upstream.body) {
      const status = upstream.status === 429 ? 429 : 502;
      const detail =
        status === 429
          ? 'Muitas mensagens em pouco tempo. Aguarde um instante e tente de novo.'
          : 'O atendimento não conseguiu processar a mensagem agora.';
      return jsonError(status === 429 ? 'rate_limited' : 'upstream_error', detail, status);
    }

    const response = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

    // Cookie httpOnly: o visitante não lê nem altera o id de sessão.
    if (created || !req.cookies.get(KIRANA_COOKIE)?.value) {
      response.cookies.set(KIRANA_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  } catch (error) {
    if (error instanceof KiranaUnavailable) {
      return jsonError(error.code, error.message, error.status);
    }
    return jsonError('internal_error', 'Falha inesperada no atendimento.', 500);
  }
}

/** A sessão do cookie pode ter expirado no servidor da Kirana. */
async function sessionStillValid(
  config: KiranaConfig,
  sessionId: string,
  ip: string,
): Promise<boolean> {
  // Sessão inexistente/expirada responde 404 — e 404 aqui é rotina, não erro.
  if (!/^s_[A-Za-z0-9-]{6,64}$/.test(sessionId)) return false;
  try {
    const res = await kiranaFetch(config, `/api/session/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      ip,
    });
    return res.ok;
  } catch {
    return false;
  }
}
