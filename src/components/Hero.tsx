"use client";

import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { asset } from "@/lib/asset";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { LAB_PROJECTS } from "@/data/portfolio";
import { whatsappLink } from "@/lib/atendenteGuiado";
import { Faixa } from "@/components/Faixa";

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
          <h1 className="t-h1 mt-5" data-split data-split-now>
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

        <aside
          className="on-dark relative isolate flex flex-col overflow-hidden bg-ink text-white lg:col-span-5"
          aria-label="Produtos que a Opportunity já construiu e a Opportunity em números"
        >
          {/* O corte inclinado das peças dos projetos em destaque, repetido aqui como assinatura do site */}
          <div className="palco-faixa" aria-hidden="true" />

          <div className="palco">
            <figure className="palco-quadro palco-a" data-reveal>
              <div data-parallax="0.02" className="palco-moldura">
                <Image
                  src={asset("/assets/img/armada-nexus-2.jpg")}
                  alt="Armada Nexus RPG: mesa virtual de RPG com mapa tático"
                  width={1600}
                  height={772}
                  sizes="(max-width: 1024px) 90vw, 30vw"
                  priority
                  className="h-auto w-full"
                />
                <figcaption>Armada Nexus RPG</figcaption>
              </div>
            </figure>
            <figure className="palco-quadro palco-b" data-reveal>
              <div data-parallax="0.07" className="palco-moldura">
                <Image
                  src={asset("/assets/img/mordenrpg-inicio.jpg")}
                  alt="MordenRPG: portal de RPG e comunidade"
                  width={1194}
                  height={870}
                  sizes="(max-width: 1024px) 60vw, 20vw"
                  className="h-auto w-full"
                />
                <figcaption>MordenRPG</figcaption>
              </div>
            </figure>
            <figure className="palco-quadro palco-c" data-reveal>
              <div data-parallax="0.12" className="palco-moldura">
                <Image
                  src={asset("/assets/img/gabi-interface-oficial.jpg")}
                  alt="Gabi: assistente de voz para Android, tela inicial"
                  width={748}
                  height={1536}
                  sizes="(max-width: 1024px) 30vw, 11vw"
                  className="h-auto w-full"
                />
                <figcaption>Gabi · Android</figcaption>
              </div>
            </figure>
          </div>

          <ul className="relative z-10 grid grid-cols-3 divide-x divide-white/15 border-t border-white/15">
            {numeros.map((n) => (
              <li key={n.texto} className="px-4 py-5 sm:px-6">
                <span className="block font-display text-4xl font-semibold leading-none text-accent sm:text-5xl" data-count={n.valor}>
                  {n.valor}
                </span>
                <span className="mt-2 block text-[0.8125rem] leading-snug text-slate-300">{n.texto}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate("destaques")}
            className="relative z-10 flex w-full items-center justify-between border-t border-white/15 px-5 py-4 text-left text-[0.9375rem] font-semibold text-white transition-colors hover:text-accent sm:px-6"
          >
            <span>Conheça os projetos do laboratório</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>

      <Faixa className="mt-[clamp(3.5rem,2rem+5vw,7rem)]" />
    </section>
  );
}
