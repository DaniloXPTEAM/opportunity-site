"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { LAB_PROJECTS } from "@/data/portfolio";
import { whatsappLink } from "@/lib/atendenteGuiado";

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

/**
 * Abertura: o que a Opportunity faz, para quem, e o próximo passo.
 * Só fatos verificáveis (quantas frentes e quantos projetos); nada de métrica de
 * desempenho, prazo ou resultado prometido.
 */
export function Hero({ onNavigate }: HeroProps) {
  const numeros = [
    { valor: SOLUCOES_NEGOCIO.length, texto: "frentes de solução para empresas" },
    { valor: LAB_PROJECTS.length, texto: "projetos ativos no laboratório" },
    { valor: 1, texto: "conversa para começar" },
  ];

  return (
    <section id="inicio" className="section !pb-0 pt-[calc(72px+clamp(3rem,2rem+4vw,6rem))]">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:items-stretch lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow">Soluções digitais para pequenos negócios</p>
          <h1 className="t-h1 mt-5">
            Sua empresa tem um problema? A tecnologia <span className="hl">pode ajudar</span> a resolver.
          </h1>
          <p className="t-lead mt-7">
            Criamos soluções digitais e de inteligência artificial para simplificar tarefas, organizar atendimentos,
            melhorar processos e ajudar pequenos negócios a crescer. Você explica o que precisa; nós estudamos a melhor
            maneira de resolver.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate("contato")} className="btn btn-primary">
              <span>Conte o desafio da sua empresa</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={whatsappLink("Olá! Vim pelo site da Opportunity AI e gostaria de conversar sobre uma solução para o meu negócio.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-line"
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          <p className="mt-7 max-w-xl border-l-2 border-accent pl-4 text-[0.9375rem] text-slate-600">
            Soluções sob medida: escopo, prazo e valor são combinados na conversa, antes de qualquer compromisso.
          </p>
        </div>

        <aside className="on-dark flex flex-col bg-ink text-white lg:col-span-5" aria-label="A Opportunity em números">
          <ul className="flex flex-1 flex-col divide-y divide-white/15">
            {numeros.map((n) => (
              <li key={n.texto} className="flex flex-1 items-center gap-6 px-7 py-6 sm:px-9">
                <span className="font-display text-6xl font-semibold leading-none text-accent sm:text-7xl">{n.valor}</span>
                <span className="text-base text-slate-200">{n.texto}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate("destaques")}
            className="flex w-full items-center justify-between border-t border-white/15 px-7 py-5 text-left text-[0.9375rem] font-semibold text-white transition-colors hover:text-accent sm:px-9"
          >
            <span>Conheça os projetos do laboratório</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>

      <div className="wrap mt-[clamp(3.5rem,2rem+5vw,7rem)] border-t border-slate-200" />
    </section>
  );
}
