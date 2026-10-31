"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { asset } from "@/lib/asset";
import { whatsappLink } from "@/lib/atendenteGuiado";
import { KIRANA_SITE_ID, KIRANA_URL, caminhoParaSecao, secaoParaCaminho } from "@/lib/kiranaRemota";

/** Contrato do módulo `widget/kirana-v2.js`, servido pela própria Kirana. */
type MontarKirana = (opcoes: {
  runtimeUrl: string;
  siteId: string;
  siteName: string;
  allowlist: string[];
  initialPath: string;
  onNavigate: (caminho: string) => void;
  target: HTMLElement;
}) => HTMLElement;

interface KiranaRemotoPanelProps {
  /** O painel continua montado depois de fechado, para manter a conversa. */
  visivel: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  /** Seção visível quando o painel foi montado (contexto da página). */
  currentSection: string;
  /** Falha ao carregar o widget: o seletor volta ao atendimento guiado. */
  onFalha: () => void;
}

/**
 * Painel da Kirana online (CopilotKit v2 + LangGraph, no backend dela).
 * Mesma moldura do atendimento guiado; o conteúdo é o widget da Kirana.
 * Nenhum segredo passa por aqui: o navegador só conhece o endereço público.
 */
export function KiranaRemotoPanel({ visivel, onClose, onNavigate, currentSection, onFalha }: KiranaRemotoPanelProps) {
  const alvo = useRef<HTMLDivElement>(null);
  const [carregando, setCarregando] = useState(true);
  // Valores lidos só na montagem; não devem refazer o carregamento do widget.
  const inicial = useRef({ currentSection, onNavigate, onFalha });

  useEffect(() => {
    let vivo = true;
    const destino = alvo.current;
    if (!destino) return;
    import(/* webpackIgnore: true */ `${KIRANA_URL}/widget/kirana-v2.js`)
      .then((modulo: { mountKiranaV2?: MontarKirana }) => {
        if (!vivo) return;
        if (typeof modulo.mountKiranaV2 !== "function") throw new Error("widget sem mountKiranaV2");
        modulo.mountKiranaV2({
          runtimeUrl: `${KIRANA_URL}/api/copilot`,
          siteId: KIRANA_SITE_ID,
          siteName: "Opportunity AI",
          allowlist: [],
          initialPath: secaoParaCaminho(inicial.current.currentSection),
          // A Kirana decide e autoriza no servidor; aqui só traduzimos a rota em seção.
          onNavigate: (caminho) => {
            const secao = caminhoParaSecao(caminho);
            if (secao) inicial.current.onNavigate(secao);
          },
          target: destino,
        });
        setCarregando(false);
      })
      .catch(() => {
        if (vivo) inicial.current.onFalha();
      });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div
      className={`${
        visivel ? "flex" : "hidden"
      } fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-w-[440px] h-[580px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex-col overflow-hidden`}
      role="dialog"
      aria-label="Atendente Kirana"
      data-testid="kirana-remota"
    >
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-blue-600">
            <Image src={asset("/assets/img/logo-mark.png")} alt="Kirana" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-white">Kirana · Opportunity AI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Agente Inteligente Residente</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="relative flex-1 min-h-0 bg-white">
        {carregando && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">Conectando à Kirana…</p>
        )}
        <div ref={alvo} className="h-full w-full" />
      </div>
      <p className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] leading-relaxed text-slate-500">
        Falar com a equipe:{" "}
        <a
          className="font-semibold text-emerald-700 underline"
          href={whatsappLink("Olá! Vim pelo site da Opportunity AI.")}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp (85) 99946-2763
        </a>{" "}
        ou{" "}
        <button className="font-semibold text-blue-700 underline" onClick={() => onNavigate("contato")}>
          formulário de contato
        </button>
        .
      </p>
    </div>
  );
}
