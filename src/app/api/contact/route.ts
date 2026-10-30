import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Formulário de contato — sem promessa falsa.
 *
 * O endpoint original só fazia `console.log` e respondia "Mensagem recebida com
 * sucesso". Em produção isso é mentira: o visitante acredita que a equipe foi
 * avisada quando nada saiu do servidor.
 *
 * Regra adotada aqui:
 *  - a mensagem é sempre gravada no disco do servidor (nada se perde);
 *  - o envio automático só é considerado ENTREGUE se `CONTACT_WEBHOOK_URL`
 *    estiver configurado e responder 2xx;
 *  - sem webhook, a resposta diz exatamente isso (`delivery: "not_configured"`)
 *    e a interface orienta o WhatsApp, que é o canal real e público.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Lead {
  nome?: string;
  email?: string;
  whatsapp?: string;
  empresa?: string;
  interesse?: string;
  mensagem?: string;
}

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.jsonl');

async function storeLead(lead: Lead & { receivedAt: string }): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
    await fs.appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim();
  const mensagem = String(body.mensagem || '').trim();
  if (!nome || !email || !mensagem) {
    return NextResponse.json(
      { error: 'Nome, e-mail e mensagem são obrigatórios.' },
      { status: 400 },
    );
  }
  if (mensagem.length > 4000) {
    return NextResponse.json({ error: 'Mensagem muito longa.' }, { status: 400 });
  }

  const lead = {
    nome,
    email,
    whatsapp: String(body.whatsapp || '').trim(),
    empresa: String(body.empresa || '').trim(),
    interesse: String(body.interesse || '').trim(),
    mensagem,
    receivedAt: new Date().toISOString(),
  };

  const stored = await storeLead(lead);
  if (!stored) {
    return NextResponse.json(
      { error: 'Não foi possível registrar sua mensagem.', delivery: 'failed' },
      { status: 500 },
    );
  }

  const webhook = (process.env.CONTACT_WEBHOOK_URL || '').trim();
  if (!webhook) {
    return NextResponse.json(
      {
        ok: true,
        delivery: 'not_configured',
        message:
          'Sua mensagem foi registrada neste servidor, mas o envio automático para a equipe ainda não está configurado. Para atendimento imediato, use o WhatsApp (85) 99946-2763.',
      },
      { status: 202 },
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`webhook ${res.status}`);
    return NextResponse.json({ ok: true, delivery: 'sent', message: 'Mensagem enviada para a equipe.' });
  } catch {
    return NextResponse.json(
      {
        ok: true,
        delivery: 'failed',
        message:
          'Sua mensagem ficou registrada aqui, mas o envio automático falhou. Fale pelo WhatsApp (85) 99946-2763 para resposta imediata.',
      },
      { status: 502 },
    );
  }
}
