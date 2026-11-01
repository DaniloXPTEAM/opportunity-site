"use client";

import Image from "next/image";
import type { KeyboardEvent, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { asset } from "@/lib/asset";
import { LAB_PROJECTS, ProjectItem } from "@/data/portfolio";

interface DiagonalShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
  onNavigate: (sectionId: string) => void;
}

/** Peça da montagem: abre o detalhe do projeto por clique ou pelo teclado. */
function Peca({
  className,
  rotulo,
  onAbrir,
  lado,
  children,
}: {
  className: string;
  lado: "left" | "right";
  rotulo: string;
  onAbrir: () => void;
  children: ReactNode;
}) {
  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAbrir();
    }
  };
  return (
    <div role="button" tabIndex={0} aria-label={rotulo} onClick={onAbrir} onKeyDown={aoTeclar} data-reveal={lado} className={`mosaico-peca ${className}`}>
      {children}
    </div>
  );
}

/**
 * Projetos em destaque — a montagem em peças inclinadas.
 *
 * O corte diagonal fica só na moldura de cada peça: a imagem aparece inteira (sem corte) dentro de
 * uma área reservada, e o texto fica fora dela. Mesmo sistema do resto do site: tinta azul-marinho,
 * laranja da marca e cinza claro. No celular as peças empilham em retângulos.
 */
export function DiagonalShowcase({ onSelectProject, onNavigate }: DiagonalShowcaseProps) {
  // Os de maior apelo comercial primeiro: o agente, o CRM e a produção de vídeo.
  const pAgente = LAB_PROJECTS.find((p) => p.id === "agente-adaptativo")!;
  const pCrm = LAB_PROJECTS.find((p) => p.id === "crm")!;
  const pCine = LAB_PROJECTS.find((p) => p.id === "cineforma")!;

  const capacidades = [
    "Desenvolvimento de produtos digitais",
    "Inteligência artificial aplicada",
    "Plataformas e comunidades online",
    "Soluções sob medida para o seu negócio",
  ];

  return (
    <section id="destaques" className="section bg-white">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <header className="lg:col-span-7">
            <p className="eyebrow">Produtos digitais com propósito</p>
            <h2 className="t-h2 mt-4" data-split>
              Tecnologia que abre novas histórias.
            </h2>
          </header>
          <div className="lg:col-span-5">
            <p className="t-lead">
              Da inteligência artificial às plataformas de RPG, criamos experiências digitais que conectam pessoas, ideias
              e oportunidades.
            </p>
            <button
              onClick={() => onNavigate("projetos")}
              className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-blue-700"
            >
              <span>Conheça nossos produtos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* A montagem */}
        <div className="mosaico mt-14">
          <Peca lado="left" className="mosaico-a bg-ink text-white" rotulo="Abrir o projeto Agente Adaptativo" onAbrir={() => onSelectProject(pAgente)}>
            <div className="mosaico-imagem bg-slate-900" data-wipe>
              <Image
                src={asset("/assets/img/hero-agent-adaptive.jpg")}
                alt="Agente Adaptativo: três identidades do mesmo agente e telas de CRM, jogo e aplicativo"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold text-blue-300">Agente Adaptativo · Produto</p>
              <h3 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">Agente Adaptativo</h3>
              <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-300">
                Agente de IA que assume diferentes identidades, personalidades e funções para atuar em sites, aplicativos,
                atendimento, mensageiros e jogos, usando o conhecimento e as ferramentas de cada ambiente. Aqui ele atende
                como <strong className="font-semibold text-white">Kirana</strong>.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-accent">
                Saiba mais <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Peca>

          <Peca lado="right" className="mosaico-b bg-accent text-ink" rotulo={`Abrir o projeto ${pCrm.title}`} onAbrir={() => onSelectProject(pCrm)}>
            <div className="mosaico-lado-imagem bg-ink" data-wipe>
              <Image
                src={asset("/assets/img/opportunity-crm.jpg")}
                alt={`${pCrm.title}: ilustração conceitual de funil, conversas e qualificação`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 18vw"
              />
            </div>
            <div className="mosaico-lado-texto">
              <p className="text-sm font-semibold">{pCrm.category}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{pCrm.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-snug">{pCrm.lead}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.9375rem] font-bold underline underline-offset-4">
                Explorar <ArrowRight className="h-4 w-4" />
              </span>
              <span className="mt-2 block text-xs opacity-75">Imagem: ilustração conceitual</span>
            </div>
          </Peca>

          <Peca lado="right" className="mosaico-c bg-slate-100 text-ink" rotulo={`Abrir o projeto ${pCine.title}`} onAbrir={() => onSelectProject(pCine)}>
            <div className="mosaico-lado-imagem bg-ink" data-wipe>
              <Image
                src={asset("/assets/img/cineforma.jpg")}
                alt={`${pCine.title}: tela do estúdio de histórias`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 18vw"
              />
            </div>
            <div className="mosaico-lado-texto">
              <p className="text-sm font-semibold text-blue-700">{pCine.category}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{pCine.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-snug text-slate-600">{pCine.lead}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-ink underline decoration-accent decoration-2 underline-offset-4">
                Saiba mais <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Peca>
        </div>

        {/* O que os projetos demonstram */}
        <div className="mt-20 grid gap-8 border-t border-slate-200 pt-12 lg:grid-cols-12 lg:gap-16">
          <h3 className="t-h2 !text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] lg:col-span-5">O que esses projetos demonstram.</h3>
          <div className="lg:col-span-7">
            <p className="t-lead !max-w-none">
              Plataformas completas, agentes de conversa, ferramentas de criação e jogos, todos construídos do zero. É a
              mesma capacidade técnica que atende uma empresa que precisa organizar o atendimento, aplicada a problemas
              diferentes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button onClick={() => onNavigate("solucoes")} className="btn btn-dark">
                <span>Ver soluções para empresas</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate("projetos")}
                className="text-[0.9375rem] font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-blue-700"
              >
                Ver o catálogo completo do laboratório →
              </button>
            </div>
          </div>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {capacidades.map((c, i) => (
            <li key={c} className="flex items-baseline gap-4 bg-white p-6">
              <span className="font-display text-xl font-semibold text-blue-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-base font-semibold leading-snug">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
