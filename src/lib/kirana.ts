/**
 * Ponte entre o novo site Opportunity AI e o backend da Kirana v0.5.3.
 *
 * Regra de ouro: **o navegador nunca fala com a Kirana**. Quem fala é este
 * servidor (Next route handler). Assim:
 *  - nenhuma chave, token de serviço ou endereço interno do Gateway chega ao
 *    JavaScript público;
 *  - a Kirana não precisa de CORS nem de `frame-ancestors` para este site, e
 *    pode ficar em rede privada, acessível só pelo servidor do site;
 *  - o cookie de sessão é `httpOnly`, então o visitante não consegue ler nem
 *    forjar o identificador de sessão de outro visitante.
 *
 * Este arquivo roda apenas no servidor (importado por route handlers).
 */

/** Cookie que guarda o id de sessão criado pela Kirana. Opaco para o cliente. */
export const KIRANA_COOKIE = 'kirana_sid';

export interface KiranaConfig {
  /** Endereço interno do backend da Kirana (nunca exposto ao navegador). */
  url: string;
  /** Token de acesso da Kirana, quando ela roda com `KIRANA_ACCESS_TOKEN`. */
  token: string;
  /** Site registrado no kit da Kirana (`sites/<id>/site.json`). */
  siteId: string;
  /** Tempo máximo de espera por resposta, em ms. */
  timeoutMs: number;
}

const DEFAULT_URL = 'http://127.0.0.1:3000';

/** Lê a configuração do ambiente. Ausência de `KIRANA_URL` = Kirana desligada. */
export function kiranaConfig(): KiranaConfig | null {
  const url = (process.env.KIRANA_URL || '').trim().replace(/\/+$/, '');
  if (!url) return null;
  return {
    url: url || DEFAULT_URL,
    token: (process.env.KIRANA_TOKEN || '').trim(),
    siteId: (process.env.KIRANA_SITE_ID || 'opportunity-ai').trim(),
    timeoutMs: Number(process.env.KIRANA_TIMEOUT_MS || 120000),
  };
}

/**
 * Converte a seção da página única do site em uma página que a Kirana conhece.
 *
 * O site novo é uma página com seções; o conhecimento da Kirana é indexado por
 * caminho (`/solucoes/`, `/labs/`, ...). Enviar `pageId` inventado faria a
 * Kirana perder o contexto da página — então mapeamos para a rota equivalente.
 * Valor desconhecido cai na home, nunca em navegação arbitrária.
 */
export function sectionToSitePath(section?: string | null): { path: string; pageId: string } {
  const map: Record<string, { path: string; pageId: string }> = {
    inicio: { path: '/', pageId: 'home' },
    solucoes: { path: '/solucoes/', pageId: 'solucoes' },
    destaques: { path: '/labs/', pageId: 'labs' },
    projetos: { path: '/labs/', pageId: 'labs' },
    agente: { path: '/labs/kirana', pageId: 'labs-kirana' },
    processo: { path: '/tecnologia', pageId: 'tecnologia' },
    sobre: { path: '/sobre', pageId: 'sobre' },
    contato: { path: '/contato', pageId: 'contato' },
    // Compatibilidade: ids de seção usados antes da reorganização continuam
    // mapeados, para que uma conversa antiga não perca o contexto da página.
    'demo-kirana': { path: '/labs/kirana', pageId: 'labs-kirana' },
    tecnologia: { path: '/tecnologia', pageId: 'tecnologia' },
  };
  return map[String(section || 'inicio')] ?? map.inicio;
}

/** Cabeçalhos de autenticação da Kirana (token nunca sai do servidor). */
export function kiranaHeaders(config: KiranaConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;
  return headers;
}

/**
 * IP real do visitante, para o limite de uso por IP da Kirana continuar sendo
 * por pessoa (e não um balde único do servidor do site).
 */
export function visitorIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0]?.trim();
  if (first) return first;
  return req.headers.get('x-real-ip')?.trim() || 'desconhecido';
}

/** Erro de transporte já normalizado para a interface. */
export class KiranaUnavailable extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 503,
  ) {
    super(message);
  }
}

/** Chamada HTTP à Kirana com timeout e erro normalizado. */
export async function kiranaFetch(
  config: KiranaConfig,
  path: string,
  init: RequestInit & { ip?: string } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${config.url}${path}`, {
      ...init,
      headers: {
        ...kiranaHeaders(config),
        ...(init.ip ? { 'X-Forwarded-For': init.ip } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    return response;
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new KiranaUnavailable(
      aborted
        ? 'A Kirana demorou demais para responder.'
        : 'Não foi possível falar com o atendimento agora.',
      aborted ? 'timeout' : 'unreachable',
    );
  } finally {
    clearTimeout(timer);
  }
}
