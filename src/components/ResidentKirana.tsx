"use client";

import { asset } from "@/lib/asset";

/**
 * Build estático (GitHub Pages): não existe /api/kirana/* nesta publicação.
 * O atendente aparece como "Atendimento indisponível" — a implementação
 * completa (streaming, ferramentas, confirmação) permanece intacta para a
 * versão dinâmica, que é a mesma base de código com a flag desligada.
 */
const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Send, Sparkles, RotateCcw, ArrowRight, ShieldCheck, MessageCircle } from "lucide-react";
import { LAB_PROJECTS, ProjectItem } from "@/data/portfolio";
import { responderGuiado, whatsappLink } from "@/lib/atendenteGuiado";

import { novoId } from "@/lib/ids";

/**
 * Atendente real da Opportunity AI — Kirana v0.5.3.
 *
 * A aparência deste painel é a original do redesign (não foi redesenhada).
 * O que mudou é a LÓGICA: antes as respostas eram frases fixas devolvidas por
 * `/api/chat`; agora a conversa vai para o backend da Kirana através de
 * `/api/kirana/chat`, que é quem conversa com o Gateway. Nenhuma credencial
 * passa por aqui e nenhuma resposta é fabricada no navegador.
 *
 * Os showcases (`KiranaDemo`) NÃO passam por este componente: continuam
 * respondendo pelas respostas prontas de `/api/chat?context=scenario`, sem
 * chamar modelo e sem consumir tokens.
 */

export interface ResidentKiranaProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onSelectProject: (p: ProjectItem) => void;
  /** Seção visível no site, usada como contexto da página atual. */
  currentSection?: string;
  /** Aviso no topo da conversa (ex.: atendente com IA fora do ar ou em descanso). */
  aviso?: string | null;
}

interface ToolRun {
  name: string;
  label: string;
  ok: boolean | null;
}

interface ActionChip {
  label: string;
  /** Mensagem enviada à Kirana ao clicar (nunca é resposta pronta). */
  send: string;
}

interface PendingConfirmation {
  id: string;
  title: string;
  summary: string;
  status: "idle" | "sending";
}

interface MessageItem {
  id: string;
  sender: "user" | "kirana";
  text: string;
  time: string;
  actions?: ActionChip[];
  tools?: ToolRun[];
  confirmation?: PendingConfirmation;
  /** Botão externo (WhatsApp) mostrado pelo atendimento guiado. */
  link?: { label: string; href: string };
  error?: string;
  streaming?: boolean;
}

/** "guided" = versão estática: respostas guiadas, sem modelo de linguagem. */
type Connection = "checking" | "live" | "offline" | "guided";

const GREETING = STATIC_SITE
  ? "Olá! Esta é a versão de avaliação do site, com atendimento guiado: respondo sobre as soluções e os projetos que estão aqui, levo você às seções certas e encaminho para a equipe pelo WhatsApp quando precisar de uma pessoa."
  : "Olá! Sou a Kirana, agente inteligente residente da Opportunity AI. Posso explicar nossas soluções, apresentar os projetos do Opportunity Labs e navegar pelo site com você.";

const GREETING_ACTIONS: ActionChip[] = [
  { label: "O que a Opportunity AI faz?", send: "O que a Opportunity AI faz e quais soluções vocês oferecem?" },
  { label: "Quero um agente no meu site", send: "Quero um agente adaptativo no meu site. Como funciona?" },
  { label: "Ver os projetos do Labs", send: "Quais projetos existem no Opportunity Labs?" },
];

/** Nome legível de ferramenta: `consultar_servicos` → "consultar serviços". */
function toolLabel(name: string) {
  return name.replace(/_/g, " ");
}

/** Executa a diretiva que a Kirana autorizou (ela decide, o site obedece). */
function applySiteAction(
  action: Record<string, unknown>,
  onNavigate: (s: string) => void,
  onSelectProject: (p: ProjectItem) => void,
) {
  const type = String(action?.type || "");
  const target = typeof action?.pageId === "string" ? action.pageId : "";

  if (type === "navigate") {
    const bySection: Record<string, string> = {
      home: "inicio",
      solucoes: "solucoes",
      labs: "projetos",
      "labs-kirana": "agente",
      tecnologia: "processo",
      sobre: "sobre",
      contato: "contato",
    };
    // Páginas de serviço ("solucao-*") ficam na seção de soluções; as de projeto
    // ("labs-*") e qualquer id desconhecido, no catálogo de projetos.
    onNavigate(bySection[target] || (target.startsWith("solucao") ? "solucoes" : "projetos"));
    return;
  }

  if (type === "open_service" || type === "fill_form") {
    onNavigate("contato");
    return;
  }

  if (type === "request_input" || type === "request_upload") {
    onNavigate("contato");
    return;
  }

  // Sem tipo conhecido: nada é executado. Melhor não agir do que agir errado.
  void onSelectProject;
}

export function ResidentKirana({
  isOpen,
  onClose,
  onNavigate,
  onSelectProject,
  currentSection = "inicio",
  aviso = null,
}: ResidentKiranaProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial-1",
      sender: "kirana",
      text: GREETING,
      time: "Agora",
      actions: GREETING_ACTIONS,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<Connection>(STATIC_SITE ? "guided" : "checking");
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Uma única verificação por abertura: o painel mostra o estado real do
  // atendimento em vez de um pontinho verde decorativo.
  useEffect(() => {
    if (!isOpen) return;
    // Estático: a rota não existe, então nem tentamos (evita 404 no console).
    // O estado "guided" já é o valor inicial nesse modo.
    if (STATIC_SITE) return;
    let alive = true;
    fetch("/api/kirana/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setConnection(d?.available ? "live" : "offline");
      })
      .catch(() => {
        if (alive) setConnection("offline");
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  const patchMessage = useCallback((id: string, patch: (m: MessageItem) => MessageItem) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? patch(m) : m)));
  }, []);

  /** Lê o SSE da Kirana e aplica cada evento na mensagem em construção. */
  const consumeStream = useCallback(
    async (body: ReadableStream<Uint8Array>, messageId: string) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handle = (payload: Record<string, unknown>) => {
        const type = String(payload.type || "");
        if (type === "delta") {
          const text = typeof payload.text === "string" ? payload.text : "";
          if (text) patchMessage(messageId, (m) => ({ ...m, text: m.text + text }));
          return;
        }
        if (type === "tool_start") {
          const name = String(payload.name || "");
          patchMessage(messageId, (m) => ({
            ...m,
            tools: [...(m.tools || []), { name, label: toolLabel(name), ok: null }],
          }));
          return;
        }
        if (type === "tool_result") {
          const name = String(payload.name || "");
          const ok = payload.ok === true;
          patchMessage(messageId, (m) => {
            const tools = [...(m.tools || [])];
            const index = tools.findIndex((t) => t.name === name && t.ok === null);
            if (index >= 0) tools[index] = { ...tools[index], ok };
            else tools.push({ name, label: toolLabel(name), ok });
            return { ...m, tools };
          });
          return;
        }
        if (type === "site_action" && payload.action && typeof payload.action === "object") {
          applySiteAction(payload.action as Record<string, unknown>, onNavigate, onSelectProject);
          return;
        }
        if (type === "confirmation" && payload.action && typeof payload.action === "object") {
          const action = payload.action as Record<string, unknown>;
          patchMessage(messageId, (m) => ({
            ...m,
            confirmation: {
              id: String(action.id || ""),
              title: String(action.title || "Confirmar ação"),
              summary: String(action.summary || ""),
              status: "idle",
            },
          }));
          return;
        }
        if (type === "error") {
          const message =
            typeof payload.message === "string" && payload.message
              ? payload.message
              : "Não consegui concluir esta resposta agora.";
          patchMessage(messageId, (m) => ({ ...m, error: message }));
          return;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut = buffer.indexOf("\n\n");
        while (cut >= 0) {
          const frame = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          const dataLines = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim());
          if (dataLines.length) {
            try {
              handle(JSON.parse(dataLines.join("\n")));
            } catch {
              // Frame parcial/comentário de keep-alive: ignorado de propósito.
            }
          }
          cut = buffer.indexOf("\n\n");
        }
      }
    },
    [onNavigate, onSelectProject, patchMessage],
  );

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading) return;

    const userMsg: MessageItem = {
      id: novoId("u"),
      sender: "user",
      text,
      time: "Agora",
    };

    // Versão estática: resposta guiada local, sem rede e sem modelo.
    if (STATIC_SITE) {
      const resp = responderGuiado(text);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: novoId("k"),
          sender: "kirana",
          text: resp.texto,
          time: "Agora",
          actions: resp.sugestoes.map((s) => ({ label: s.label, send: s.pergunta })),
          link: resp.link,
        },
      ]);
      setInputText("");
      if (resp.secao) onNavigate(resp.secao);
      return;
    }

    const kiranaId = novoId("k");
    const placeholder: MessageItem = {
      id: kiranaId,
      sender: "kirana",
      text: "",
      time: "Agora",
      tools: [],
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInputText("");
    setIsLoading(true);
    setLastFailed(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/kirana/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, section: currentSection }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null);
        const code = detail?.error?.code || "upstream_error";
        const friendly =
          code === "rate_limited"
            ? "Você enviou várias mensagens em pouco tempo. Respire e tente de novo em alguns segundos."
            : code === "kirana_not_configured"
              ? "O atendimento inteligente não está configurado neste ambiente."
              : "Estou sem conexão com o atendimento agora. Você pode falar com a equipe pelo WhatsApp ou pelo formulário de contato.";
        patchMessage(kiranaId, (m) => ({ ...m, text: friendly, error: friendly, streaming: false }));
        setConnection(code === "kirana_not_configured" ? "offline" : connection);
        setLastFailed(text);
        return;
      }

      setConnection("live");
      await consumeStream(res.body, kiranaId);
      patchMessage(kiranaId, (m) => ({
        ...m,
        streaming: false,
        text: m.text.trim() || "…",
      }));
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        patchMessage(kiranaId, (m) => ({ ...m, streaming: false }));
      } else {
        patchMessage(kiranaId, (m) => ({
          ...m,
          error: "Falha de rede ao falar com o atendimento.",
          text: m.text || "Falha de rede ao falar com o atendimento.",
          streaming: false,
        }));
        setLastFailed(text);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleConfirm = async (messageId: string, approve: boolean) => {
    const target = messages.find((m) => m.id === messageId)?.confirmation;
    if (!target) return;
    patchMessage(messageId, (m) => ({
      ...m,
      confirmation: m.confirmation ? { ...m.confirmation, status: "sending" } : undefined,
    }));

    const kiranaId = novoId("k-c");
    setMessages((prev) => [
      ...prev,
      {
        id: kiranaId,
        sender: "kirana",
        text: "",
        time: "Agora",
        tools: [],
        streaming: true,
      },
    ]);

    try {
      const res = await fetch("/api/kirana/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: target.id, approve }),
      });
      if (!res.ok || !res.body) throw new Error("confirm_failed");
      await consumeStream(res.body, kiranaId);
      patchMessage(kiranaId, (m) => ({ ...m, streaming: false, text: m.text.trim() || "…" }));
      patchMessage(messageId, (m) => ({ ...m, confirmation: undefined }));
    } catch {
      patchMessage(kiranaId, (m) => ({
        ...m,
        streaming: false,
        error: "Não foi possível registrar sua decisão agora.",
        text: "Não foi possível registrar sua decisão agora. Tente novamente.",
      }));
      patchMessage(messageId, (m) => ({
        ...m,
        confirmation: m.confirmation ? { ...m.confirmation, status: "idle" } : undefined,
      }));
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  if (!isOpen) {
    /**
     * Antes existia aqui um botão flutuante (grande, primeiro; círculo de 56px
     * depois). Nos dois formatos ele cobria texto das seções ao rolar — inclusive
     * no celular, onde a coluna ocupa a tela inteira.
     *
     * O acesso ao atendente agora fica no cabeçalho fixo (sempre visível, nunca
     * sobre o conteúdo), no rodapé e no botão do bloco de demonstração.
     */
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-w-[440px] h-[580px] bg-white rounded-lg border border-slate-200 shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Window Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-md overflow-hidden bg-blue-600 flex items-center justify-center font-bold text-sm shadow-xs">
            <Image src={asset("/assets/img/logo-mark.png")} alt="Kirana" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-white">Kirana · Opportunity AI</h3>
              <span
                className={`w-2 h-2 rounded-full ${
                  connection === "live"
                    ? "bg-emerald-400 animate-pulse"
                    : connection === "offline"
                      ? "bg-amber-400"
                      : connection === "guided"
                        ? "bg-sky-400"
                        : "bg-slate-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {connection === "offline"
                ? "Atendimento indisponível"
                : connection === "guided"
                  ? "Atendimento guiado · versão de avaliação"
                  : "Agente Inteligente Residente"}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 chat-bg text-xs sm:text-sm">
        {aviso && (
          <div
            className="flex items-start gap-2 text-slate-600 text-[11px] bg-amber-50 p-2.5 rounded-md border border-amber-200"
            role="status"
            data-testid="aviso-atendente"
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{aviso}</span>
          </div>
        )}

        {messages.map((m) => {
          const isKirana = m.sender === "kirana";
          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${isKirana ? "justify-start" : "justify-end"}`}>
              {isKirana && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  AI
                </div>
              )}
              <div className="space-y-2 max-w-[85%]">
                {(m.text || m.streaming) && (
                  <div
                    className={`p-3.5 rounded-lg shadow-xs leading-relaxed whitespace-pre-wrap ${
                      isKirana
                        ? "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                        : "bg-blue-600 text-white rounded-tr-xs"
                    }`}
                  >
                    {m.text || (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                      </span>
                    )}
                  </div>
                )}

                {/* Ferramentas usadas nesta resposta (transparência) */}
                {m.tools && m.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.tools.map((tool, idx) => (
                      <span
                        key={`${tool.name}-${idx}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] border ${
                          tool.ok === null
                            ? "bg-slate-100 text-slate-500 border-slate-200"
                            : tool.ok
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {tool.ok === true ? "✓" : tool.ok === false ? "!" : "·"} {tool.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confirmação de ação sensível */}
                {m.confirmation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {m.confirmation.title}
                    </div>
                    {m.confirmation.summary && (
                      <p className="text-[11px] text-amber-900/80 leading-relaxed">{m.confirmation.summary}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        disabled={m.confirmation.status === "sending"}
                        onClick={() => handleConfirm(m.id, true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                      <button
                        disabled={m.confirmation.status === "sending"}
                        onClick={() => handleConfirm(m.id, false)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 text-[11px] font-semibold disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Botão externo do atendimento guiado (WhatsApp) */}
                {m.link && (
                  <a
                    href={m.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {m.link.label}
                  </a>
                )}

                {/* Ações sugeridas (enviam mensagem real, não resposta pronta) */}
                {m.actions && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act.send)}
                        disabled={isLoading}
                        className="text-left px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors flex items-center justify-between group disabled:opacity-50"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {connection === "offline" && (
          <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-white p-2.5 rounded-md border border-slate-200">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Atendimento automático fora do ar. Fale com a equipe pelo WhatsApp{" "}
              <a className="font-semibold text-emerald-700 underline" href={whatsappLink("Olá! Vim pelo site da Opportunity AI.")} target="_blank" rel="noreferrer">
                (85) 99946-2763
              </a>{" "}
              ou pelo{" "}
              <button className="font-semibold text-blue-700 underline" onClick={() => onNavigate("contato")}>
                formulário de contato
              </button>
              .
            </span>
          </div>
        )}

        {lastFailed && !isLoading && (
          <button
            onClick={() => handleSend(lastFailed)}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
          >
            <RotateCcw className="w-3 h-3" /> Tentar novamente
          </button>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Triggers */}
      <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSend("Quero um agente adaptativo no meu site. Como funciona?")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold whitespace-nowrap border border-blue-200 shrink-0 disabled:opacity-50"
        >
          Quero uma no meu site 🚀
        </button>
        <button
          onClick={() => handleSend("Quais soluções a Opportunity AI oferece?")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          Ver soluções 🧩
        </button>
        <button
          onClick={() => handleSend("Mostre os projetos de RPG do Labs.")}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          Projetos RPG 🎲
        </button>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            connection === "guided"
              ? "Pergunte sobre soluções, projetos ou contato..."
              : "Pergunte algo à Kirana da Opportunity AI..."
          }
          aria-label="Mensagem para o atendente"
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-hidden"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
          aria-label="Enviar mensagem"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
