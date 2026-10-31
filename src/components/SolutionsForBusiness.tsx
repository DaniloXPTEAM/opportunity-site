"use client";

import Image from "next/image";
import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { asset } from "@/lib/asset";
import { hasAsset, hideMissingImage } from "@/lib/media";
import {
  MessageSquare,
  Users,
  Workflow,
  MonitorSmartphone,
  ChartColumn,
  ArrowRight,
  ChevronDown,
  Check,
} from "lucide-react";

interface SolutionsForBusinessProps {
  onNavigate: (sectionId: string) => void;
}

const ICONES = {
  atendimento: MessageSquare,
  clientes: Users,
  automacao: Workflow,
  sites: MonitorSmartphone,
  relatorios: ChartColumn,
} as const;

/**
 * Soluções para empresas — a seção comercial principal.
 *
 * Ordem narrativa de cada cartão: problema do dia a dia → como a solução
 * funciona (sem jargão) → o ganho esperado → detalhes técnicos recolhidos.
 * Nenhum cartão promete prazo, resultado garantido ou número de desempenho.
 */
export function SolutionsForBusiness({ onNavigate }: SolutionsForBusinessProps) {
  return (
    <section id="solucoes" className="relative py-20 sm:py-24 bg-white border-b border-slate-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Cabeçalho da seção */}
        <div className="max-w-3xl">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-blue-700">Soluções para empresas</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Problemas comuns de quem toca um negócio.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Você não precisa saber o nome técnico de nada. Escolha abaixo o que mais se parece com o seu dia a dia — a
            solução é desenhada a partir dele.
          </p>
        </div>

        {/* Cinco problemas reais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOLUCOES_NEGOCIO.map((s, i) => {
            const Icone = ICONES[s.icone];
            return (
              <article
                key={s.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icone className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-300">0{i + 1}</span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 font-display">{s.titulo}</h3>
                <p className="mt-1 text-sm font-medium text-blue-700">{s.resumo}</p>

                <div className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">O problema</p>
                    <p className="mt-1 text-slate-600">{s.problema}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Como funciona
                    </p>
                    <p className="mt-1 text-slate-700">{s.comoFunciona}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                      O que muda no seu dia
                    </p>
                    <p className="mt-1 text-slate-700">{s.ganho}</p>
                  </div>
                </div>

                {/* Detalhes técnicos: recolhidos por padrão */}
                <details className="mt-4 group/details border-t border-slate-100 pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-500 hover:text-blue-700">
                    <span>Detalhes técnicos (opcional)</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open/details:rotate-180" />
                  </summary>
                  <ul className="mt-3 space-y-1.5">
                    {s.detalhes.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })}

          {/* Cartão de fechamento: convite à conversa */}
          <article className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900 text-white">
            {/* Imagem ilustrativa gerada por IA (não é equipe nem cliente real). Sem o arquivo, o cartão
                segue só com o texto. */}
            {hasAsset("/assets/img/processo-inteligente-empresas.jpg") && (
              <div className="relative h-44 w-full shrink-0 bg-slate-800">
                <Image
                  src={asset("/assets/img/processo-inteligente-empresas.jpg")}
                  alt="Ilustração gerada por IA: equipe de uma pequena empresa conversando sobre um fluxo de trabalho"
                  fill
                  className="object-cover object-[50%_35%]"
                  onError={hideMissingImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute right-3 top-3 rounded-full bg-slate-900/75 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
                  Ilustração gerada por IA
                </span>
              </div>
            )}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/20 blur-2xl" />
            <div className="relative space-y-3 p-6">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-cyan-300">
                Não encontrou seu caso?
              </p>
              <h3 className="text-xl font-bold font-display leading-snug">
                O problema pode ser outro. A conversa começa por ele.
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Cada empresa tem um gargalo diferente. Conte como o seu negócio funciona hoje e avaliamos, sem
                compromisso, se tecnologia ajuda a resolver — e como.
              </p>
            </div>
            <button
              onClick={() => onNavigate("contato")}
              className="relative m-6 mt-0 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
            >
              <span>Conte o desafio da sua empresa</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
