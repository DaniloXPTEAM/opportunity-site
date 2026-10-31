"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, MessageCircle, Minus, Plus } from "lucide-react";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { asset } from "@/lib/asset";
import { hasAsset, hideMissingImage } from "@/lib/media";
import { whatsappLink } from "@/lib/atendenteGuiado";

interface SolutionsForBusinessProps {
  onNavigate: (sectionId: string) => void;
}

/**
 * Soluções para empresas — a seção comercial principal.
 *
 * Um índice numerado em faixa escura: o visitante reconhece o problema pelo título e abre
 * só o que interessa. Ordem de cada item: problema do dia a dia → como funciona (sem jargão)
 * → o que muda → detalhes técnicos. Nenhum item promete prazo, resultado garantido ou número
 * de desempenho.
 */
export function SolutionsForBusiness({ onNavigate }: SolutionsForBusinessProps) {
  const [aberto, setAberto] = useState<string | null>(SOLUCOES_NEGOCIO[0]?.id ?? null);
  const ilustracao = "/assets/img/processo-inteligente-empresas.jpg";

  return (
    <section id="solucoes" className="on-dark section bg-ink text-white">
      <div className="wrap">
        <header className="max-w-3xl">
          <p className="eyebrow on-dark">Soluções para empresas</p>
          <h2 className="t-h2 mt-4">Problemas comuns de quem toca um negócio.</h2>
          <p className="t-lead mt-5">
            Você não precisa saber o nome técnico de nada. Escolha o que mais se parece com o seu dia a dia: a solução é
            desenhada a partir dele.
          </p>
        </header>

        <ol className="mt-14 border-t border-white/20" data-stagger>
          {SOLUCOES_NEGOCIO.map((s, i) => {
            const aberta = aberto === s.id;
            return (
              <li key={s.id} className={`border-b border-white/20 transition-colors ${aberta ? "bg-white/[0.04]" : ""}`}>
                <h3>
                  <button
                    onClick={() => setAberto(aberta ? null : s.id)}
                    aria-expanded={aberta}
                    aria-controls={`sol-${s.id}`}
                    className="group grid w-full grid-cols-[3.25rem_1fr_auto] items-center gap-x-4 px-1 py-6 text-left sm:grid-cols-[5.5rem_1fr_auto] sm:gap-x-6 sm:py-7"
                  >
                    <span className="font-display text-4xl font-semibold leading-none text-accent sm:text-5xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-semibold leading-tight sm:text-[1.9rem]">{s.titulo}</span>
                      <span className="mt-1.5 block text-[0.9375rem] font-normal text-slate-300 sm:text-base">{s.resumo}</span>
                    </span>
                    <span
                      className={`flex h-10 w-10 items-center justify-center border transition-colors ${
                        aberta ? "border-accent bg-accent text-ink" : "border-white/30 text-white group-hover:border-white"
                      }`}
                      aria-hidden="true"
                    >
                      {aberta ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </span>
                  </button>
                </h3>

                {aberta && (
                  <div id={`sol-${s.id}`} className="grid gap-x-10 gap-y-8 px-1 pb-10 sm:pl-[calc(5.5rem+1.5rem)] lg:grid-cols-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-300">O problema</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-200">{s.problema}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-300">Como funciona</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-200">{s.comoFunciona}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-300">O que muda no seu dia</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-200">{s.ganho}</p>
                    </div>
                    <div className="lg:col-span-3">
                      <p className="text-sm font-semibold text-slate-400">Detalhes técnicos</p>
                      <ul className="mt-2 grid gap-x-10 gap-y-1.5 text-sm text-slate-300 sm:grid-cols-2">
                        {s.detalhes.map((d) => (
                          <li key={d} className="flex gap-2.5">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Fechamento: convite à conversa */}
        <div className="on-light mt-16 grid overflow-hidden bg-white text-ink lg:grid-cols-12">
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:col-span-7">
            <div>
              <p className="eyebrow">Não encontrou o seu caso?</p>
              <h3 className="t-h2 mt-4 !text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)]">
                Qual dessas áreas faz sentido para você? A conversa começa por ela.
              </h3>
            </div>
            <p className="max-w-xl text-slate-600">
              Cada empresa tem um gargalo diferente. Descreva o seu caso e indicamos o melhor ponto de partida: avaliamos,
              sem compromisso, se tecnologia ajuda a resolver, e como. Escopo, prazo e valor são combinados na conversa.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigate("contato")} className="btn btn-primary">
                <span>Conte o desafio da sua empresa</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={whatsappLink("Olá! Gostaria de conversar sobre as soluções da Opportunity AI.")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-line"
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
          {hasAsset(ilustracao) && (
            <figure className="relative aspect-[4/5] bg-ink lg:col-span-5">
              <Image
                src={asset(ilustracao)}
                alt="Ilustração gerada por IA: equipe de uma pequena empresa conversando sobre um fluxo de trabalho"
                fill
                className="object-contain"
                onError={hideMissingImage}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <figcaption className="absolute bottom-3 right-3 bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
                Ilustração gerada por IA
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
