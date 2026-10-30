"use client";

import { asset } from "@/lib/asset";

import Image from "next/image";
import { ArrowUp, Sparkles, MessageSquare, Mail, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenKirana: () => void;
}

export function Footer({ onNavigate, onOpenKirana }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-blue-600">
                <Image src={asset("/assets/img/logo-mark.png")} alt="Opportunity AI" fill className="object-cover" />
              </div>
              <span className="text-xl font-bold font-display text-white">
                Opportunity <span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Soluções digitais e de inteligência artificial para pequenos negócios — do atendimento ao
              relatório que apoia a decisão.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenKirana}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Falar sobre meu projeto</span>
              </button>
            </div>
          </div>

          {/* Nav links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Navegação</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate("inicio")} className="hover:text-white transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("destaques")} className="hover:text-white transition-colors">
                  Projetos em destaque
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("projetos")} className="hover:text-white transition-colors">
                  Catálogo do laboratório
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("agente")} className="hover:text-white transition-colors">
                  Agente Adaptativo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("processo")} className="hover:text-white transition-colors">
                  Como trabalhamos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Soluções para empresas
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Soluções</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Atendimento ao cliente
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Organização de clientes e vendas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Automação de tarefas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Sites e sistemas personalizados
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("solucoes")} className="hover:text-white transition-colors">
                  Relatórios e informações
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts & Edge deployment */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Contato</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="mailto:rafael@opportunity.ia.br"
                  className="hover:text-white transition-colors font-mono"
                >
                  rafael@opportunity.ia.br
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5585999462763"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Comercial
                </a>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 font-mono">
                Fortaleza · Ceará · atendimento remoto
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Opportunity AI. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("sobre")}
              className="hover:text-slate-300 transition-colors"
            >
              Termos e Privacidade
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
