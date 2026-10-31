/**
 * Kirana online (agente real) para o site estático.
 *
 * O site no GitHub Pages não tem servidor. Quando existe um endereço da Kirana
 * (`NEXT_PUBLIC_KIRANA_URL`, definido no build), o navegador carrega o widget da
 * própria Kirana e fala com ela direto. O endereço é público, então **não há
 * chave nem segredo aqui**: a chave do Gateway fica só no PC de quem opera.
 *
 * Sem endereço, ou com a Kirana fora do ar (PC desligado, rede, descanso
 * noturno), o painel usa o atendimento guiado, que não depende de nada externo.
 */

/** Endereço público da Kirana, sem barra no fim. Vazio = recurso desligado. */
export const KIRANA_URL = (process.env.NEXT_PUBLIC_KIRANA_URL || "").trim().replace(/\/+$/, "");

/** Id do site na Kirana (`sites/<id>`). */
export const KIRANA_SITE_ID = (process.env.NEXT_PUBLIC_KIRANA_SITE_ID || "opportunity-ai").trim();

export const KIRANA_REMOTA_CONFIGURADA = KIRANA_URL.length > 0;

/**
 * Janela de descanso do computador que hospeda a Kirana, no fuso de Fortaleza
 * ("HH:MM-HH:MM"). Fora dela a Kirana deve estar de pé; dentro, nem tentamos
 * conectar: o visitante vê o aviso na hora, sem esperar timeout.
 * Valor vazio desliga a janela.
 */
const DESCANSO_BRUTO = (process.env.NEXT_PUBLIC_KIRANA_DESCANSO ?? "00:00-06:00").trim();
const FUSO = "America/Fortaleza";

function minutos(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

/** Texto legível da janela, para o aviso ao visitante (ex.: "0h às 6h"). */
export function descansoLegivel(): string {
  const [ini, fim] = DESCANSO_BRUTO.split("-").map((x) => minutos(x));
  if (ini === null || fim === null || ini === undefined || fim === undefined) return "";
  const fmt = (t: number) => (t % 60 === 0 ? `${t / 60}h` : `${Math.floor(t / 60)}h${String(t % 60).padStart(2, "0")}`);
  return `${fmt(ini)} às ${fmt(fim)}`;
}

/** `true` quando o horário (fuso de Fortaleza) cai dentro da janela de descanso. */
export function emDescanso(agora: Date = new Date()): boolean {
  if (!DESCANSO_BRUTO) return false;
  const [ini, fim] = DESCANSO_BRUTO.split("-").map((x) => minutos(x));
  if (ini === null || fim === null || ini === undefined || fim === undefined) return false;
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const h = Number(partes.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(partes.find((p) => p.type === "minute")?.value ?? "0");
  const atual = h * 60 + m;
  // Janela que atravessa a meia-noite (ex.: 22:00-06:00) também vale.
  return ini <= fim ? atual >= ini && atual < fim : atual >= ini || atual < fim;
}

export type MotivoGuiado = "nao-configurada" | "descanso" | "fora-do-ar";

export interface VerificacaoKirana {
  online: boolean;
  motivo: MotivoGuiado | null;
}

/**
 * Pergunta à Kirana se ela está de pé, com o Gateway alcançável **e com o login do
 * Gateway feito** (a sessão do ChatGPT é só em memória: reiniciou, caiu). O
 * `/api/status` é público e não devolve segredo. Qualquer falha (rede, CORS, 5xx,
 * túnel fora, Gateway sem login) vira "fora do ar": o painel cai no atendimento guiado.
 */
export async function verificarKirana(tempoMs = 5000): Promise<VerificacaoKirana> {
  if (!KIRANA_REMOTA_CONFIGURADA) return { online: false, motivo: "nao-configurada" };
  if (emDescanso()) return { online: false, motivo: "descanso" };
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), tempoMs);
  try {
    const resposta = await fetch(`${KIRANA_URL}/api/status`, { cache: "no-store", signal: controle.signal });
    if (!resposta.ok) return { online: false, motivo: "fora-do-ar" };
    const dados = (await resposta.json()) as {
      gateway?: { reachable?: boolean; health?: { authenticated?: boolean } };
    };
    const gateway = dados?.gateway;
    const pronto = gateway?.reachable === true && gateway?.health?.authenticated !== false;
    return pronto ? { online: true, motivo: null } : { online: false, motivo: "fora-do-ar" };
  } catch {
    return { online: false, motivo: "fora-do-ar" };
  } finally {
    clearTimeout(timer);
  }
}

/** Aviso mostrado no atendimento guiado quando a Kirana online não está disponível. */
export function avisoDoMotivo(motivo: MotivoGuiado | null): string | null {
  if (motivo === "descanso") {
    const janela = descansoLegivel();
    return `O atendente com IA descansa${janela ? ` das ${janela}` : " neste horário"}. Enquanto isso, o atendimento guiado responde o essencial; para falar com a equipe, use o WhatsApp ou o formulário.`;
  }
  if (motivo === "fora-do-ar") {
    return "O atendente com IA está fora do ar neste momento. O atendimento guiado responde o essencial; para falar com a equipe, use o WhatsApp ou o formulário.";
  }
  return null;
}

/** Rota que a Kirana conhece → seção da página única (ou `null` se não existir aqui). */
export function caminhoParaSecao(caminho: string): string | null {
  const c = `/${String(caminho || "").replace(/^\/+/, "")}`.replace(/\/+$/, "") || "/";
  if (c === "/") return "inicio";
  if (c.startsWith("/solucoes")) return "solucoes";
  if (c === "/labs/kirana") return "agente";
  if (c.startsWith("/labs")) return "projetos";
  if (c === "/tecnologia") return "processo";
  if (c === "/sobre") return "sobre";
  if (c === "/contato") return "contato";
  return null;
}

/** Seção visível → rota que a Kirana conhece (contexto da página atual). */
export function secaoParaCaminho(secao: string): string {
  const mapa: Record<string, string> = {
    inicio: "/",
    solucoes: "/solucoes/",
    destaques: "/labs/",
    projetos: "/labs/",
    agente: "/labs/kirana",
    processo: "/tecnologia",
    sobre: "/sobre",
    contato: "/contato",
  };
  return mapa[secao] ?? "/";
}
