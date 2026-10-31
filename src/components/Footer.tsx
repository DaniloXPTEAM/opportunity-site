"use client";

import { asset } from "@/lib/asset";

import Image from "next/image";
import { ArrowUp, MessageCircle } from "lucide-react";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenKirana: () => void;
}

export function Footer({ onNavigate, onOpenKirana }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navegacao = [
    { label: "Início", id: "inicio" },
    { label: "Soluções", id: "solucoes" },
    { label: "Projetos em destaque", id: "destaques" },
    { label: "Agente Adaptativo", id: "agente" },
    { label: "Catálogo do laboratório", id: "projetos" },
    { label: "Como trabalhamos", id: "processo" },
    { label: "Sobre", id: "sobre" },
    { label: "Contato", id: "contato" },
  ];

  const linkClasse = "text-[0.9375rem] text-slate-300 transition-colors hover:text-white";
  const tituloClasse = "text-sm font-semibold text-white";

  return (
    <footer className="on-dark bg-ink pb-10 pt-20 text-white">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={asset("/assets/img/logo-mark.png")} alt="Opportunity AI" fill className="object-cover" sizes="40px" />
              </span>
              <span className="font-display text-2xl font-semibold leading-none">
                Opportunity <span className="text-accent">AI</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-slate-300">
              Soluções digitais e de inteligência artificial para pequenos negócios, do atendimento ao relatório que apoia a
              decisão.
            </p>
            <button onClick={onOpenKirana} className="btn btn-primary mt-7">
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>Falar sobre meu projeto</span>
            </button>
          </div>

          <nav className="lg:col-span-2" aria-label="Navegação do rodapé">
            <h4 className={tituloClasse}>Navegação</h4>
            <ul className="mt-5 space-y-3">
              {navegacao.map((item) => (
                <li key={item.id}>
                  <button onClick={() => onNavigate(item.id)} className={linkClasse}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h4 className={tituloClasse}>Soluções</h4>
            <ul className="mt-5 space-y-3">
              {SOLUCOES_NEGOCIO.map((s) => (
                <li key={s.id}>
                  <button onClick={() => onNavigate("solucoes")} className={`${linkClasse} text-left`}>
                    {s.titulo}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className={tituloClasse}>Contato</h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a href="mailto:rafael@opportunity.ia.br" className={linkClasse}>
                  rafael@opportunity.ia.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5585999462763" target="_blank" rel="noreferrer" className={linkClasse}>
                  WhatsApp comercial
                </a>
              </li>
              <li className="text-[0.9375rem] text-slate-400">Fortaleza · Ceará · atendimento remoto</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 Opportunity AI. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate("sobre")} className="hover:text-white">
              Termos e Privacidade
            </button>
            <button
              onClick={scrollToTop}
              className="flex h-10 w-10 items-center justify-center border border-white/30 text-white hover:border-white"
              title="Voltar ao topo"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
