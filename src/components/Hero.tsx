"use client";

import { ArrowRight, MessageSquare, Play, ShieldCheck } from "lucide-react";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { LAB_PROJECTS } from "@/data/portfolio";

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

/**
 * Abertura — a primeira coisa que o visitante lê.
 *
 * Reescrita para responder em cinco segundos: o que a Opportunity faz, para
 * quem, e qual o próximo passo. Saiu o selo "PRONTA" e a métrica "24/7
 * Atendimento Contínuo" (indicavam serviço em operação permanente); entraram
 * fatos verificáveis: 9 projetos no laboratório, 5 frentes de solução e a
 * informação de que a conversa começa pelo problema.
 */
export function Hero({ onNavigate }: HeroProps) {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 mesh-hero">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Coluna esquerda: mensagem */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Soluções digitais para pequenos negócios
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-[54px] font-display">
              Sua empresa tem um problema?
              <br />
              <span className="marker text-blue-600">A tecnologia pode ajudar</span> a resolver.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Criamos soluções digitais e de inteligência artificial para simplificar tarefas, organizar atendimentos,
              melhorar processos e ajudar pequenos negócios a crescer. Você explica o que precisa. Nós estudamos a
              melhor maneira de resolver.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate("contato")}
                className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl sm:text-base"
              >
                <span>Conte o desafio da sua empresa</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="https://wa.me/5585999462763?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20Opportunity%20AI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3.5 text-sm font-semibold text-emerald-800 shadow-xs transition-all hover:border-emerald-400 sm:text-base"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Falar no WhatsApp</span>
              </a>
              <button
                onClick={() => onNavigate("destaques")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-xs transition-all hover:border-slate-400 sm:text-base"
              >
                <Play className="h-4 w-4 text-blue-600" />
                <span>Conheça nossos projetos</span>
              </button>
            </div>

            {/* Fatos verificáveis, sem promessa de desempenho */}
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-y border-slate-200/80 py-5">
              <div>
                <dt className="text-2xl font-black text-slate-900 font-display">{SOLUCOES_NEGOCIO.length}</dt>
                <dd className="mt-0.5 text-xs font-medium leading-snug text-slate-500">frentes de solução para empresas</dd>
              </div>
              <div>
                <dt className="text-2xl font-black text-blue-600 font-display">{LAB_PROJECTS.length}</dt>
                <dd className="mt-0.5 text-xs font-medium leading-snug text-slate-500">projetos ativos no laboratório</dd>
              </div>
              <div>
                <dt className="text-2xl font-black text-slate-900 font-display">1</dt>
                <dd className="mt-0.5 text-xs font-medium leading-snug text-slate-500">conversa para começar</dd>
              </div>
            </dl>

            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Soluções sob medida: escopo, prazo e valor são combinados na conversa, antes de qualquer compromisso.
              </span>
            </p>
          </div>

          {/* Coluna direita: exemplo visual de atendimento (claramente identificado como exemplo) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl" />

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">exemplo de atendimento</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                    <MessageSquare className="h-3 w-3" />
                    EXEMPLO
                  </span>
                </div>

                <div className="space-y-4 bg-slate-50/60 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      AI
                    </div>
                    <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-3.5 text-xs text-slate-800 shadow-xs sm:text-sm">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                        Atendente do seu negócio
                      </p>
                      <p className="mt-1.5">
                        Bom dia! Temos pão francês saindo do forno até as 11h e bolo de chocolate na quarta. Quer que eu
                        separe algum para você?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-blue-600 p-3.5 text-xs text-white shadow-xs sm:text-sm">
                      Queria encomendar um bolo para sexta, dá tempo?
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                      VC
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      AI
                    </div>
                    <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-3.5 text-xs text-slate-800 shadow-xs sm:text-sm">
                      Dá tempo sim. Anotei: bolo de chocolate para sexta, retirada até 17h. Vou passar para a confeiteira
                      confirmar o valor e já te aviso por aqui.
                      <span className="mt-2 block font-mono text-[10px] text-slate-400">
                        → caso encaminhado para uma pessoa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3 font-mono text-[11px] text-slate-500">
                  <span>Conversa ilustrativa · nenhum dado real</span>
                  <button
                    onClick={() => onNavigate("agente")}
                    className="font-sans font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Ver demonstração →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
