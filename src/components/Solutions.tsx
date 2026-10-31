"use client";

import { asset } from "@/lib/asset";
import { hasAsset, hideMissingImage } from "@/lib/media";

import Image from "next/image";
import { SERVICES, WORK_PROCESS, TECH_STACK } from "@/data/portfolio";
import {
  MessageSquare,
  Bot,
  BarChart3,
  GitBranch,
  Smartphone,
  PhoneCall,
  CheckCircle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";

interface SolutionsProps {
  onNavigate: (sectionId: string) => void;
}

export function Solutions({ onNavigate }: SolutionsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "agentes-personalizados":
        return <Bot className="w-5 h-5 text-blue-600" />;
      case "atendimento-whatsapp":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "crm-vendas":
        return <BarChart3 className="w-5 h-5 text-indigo-600" />;
      case "workflows-automacao":
        return <GitBranch className="w-5 h-5 text-purple-600" />;
      case "relatorios-inteligentes":
        return <BarChart3 className="w-5 h-5 text-amber-600" />;
      case "agentes-voz":
        return <PhoneCall className="w-5 h-5 text-rose-600" />;
      default:
        return <Bot className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section id="solucoes" className="py-20 bg-slate-50 relative overflow-hidden border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-24">
        {/* ================= 1. AS 6 FRENTES DE SOLUÇÕES ================= */}
        <div>
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" />
              Soluções Publicadas · 6 Frentes de Atuação
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
              Soluções de IA para o dia a dia da empresa.
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg leading-relaxed">
              O escopo é definido junto com você, e deixamos claro o que é oferta pronta para implantação e o que
              ainda é protótipo de pesquisa. Sem falsas promessas, com métricas mensuráveis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all hover:border-blue-400 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">{srv.n}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                      {getIcon(srv.id)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{srv.desc}</p>
                  </div>

                  {/* Problem & Application Breakdown */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <p>
                      <strong className="text-slate-800 font-semibold">Problema:</strong> {srv.problem}
                    </p>
                    <p>
                      <strong className="text-blue-700 font-semibold">Aplicação:</strong> {srv.application}
                    </p>
                  </div>

                  {/* Key deliverables checklist */}
                  <ul className="space-y-1.5 pt-2">
                    {srv.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics / Prazo Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 font-mono text-sm">{srv.metric}</span>
                    <span className="text-slate-500 text-[11px] block">{srv.metricLabel}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium font-mono">
                    {srv.prazo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 2. PROCESSO DE TRABALHO (5 ETAPAS) ================= */}
        <div className="pt-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-mono font-semibold uppercase tracking-wider">
              Metodologia Transparente
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display mt-3">
              Processo de Trabalho em 5 Etapas.
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Do diagnóstico inicial até a evolução assistida no ambiente de produção da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WORK_PROCESS.map((wp) => (
              <div
                key={wp.step}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 relative hover:border-blue-400 transition-colors shadow-xs"
              >
                <span className="text-2xl font-black text-blue-600 font-mono">{wp.step}</span>
                <h4 className="text-base font-bold text-slate-900 font-display">{wp.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{wp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 3. BREADCRUMB CALLOUT: "Tem um processo que poderia ser mais inteligente?" ================= */}
        {/* Updated with business photo for micro and small enterprises */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  Especial para Micro, Pequenas e Médias Empresas (PMEs)
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display leading-tight">
                  Tem um processo que poderia ser mais inteligente?
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Não é necessário revolucionar toda a sua empresa de uma vez só. Começamos com um único fluxo crítico:
                  o atendimento que demora no WhatsApp, o follow-up comercial esquecido no CRM ou a planilha manual que
                  toma horas da sua equipe toda semana.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Diagnóstico sem custo inicial</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Piloto entregue em até 14 dias</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Sem fidelidade obrigatória</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Supervisão humana garantida</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate("contato")}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-md transition-all hover:scale-105"
                  >
                    <span>Contar o Desafio da Minha Empresa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Business Office Photo for Micro and Small Enterprises */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-900">
              {/* Imagem ilustrativa gerada por IA (não é equipe nem cliente real). Se o arquivo
                  sumir do pacote, o painel escuro com o texto embaixo se mantém. */}
              {hasAsset("/assets/img/processo-inteligente-empresas.jpg") && (
                <Image
                  src={asset("/assets/img/processo-inteligente-empresas.jpg")}
                  alt="Imagem ilustrativa gerada por IA: equipe de uma pequena empresa em escritório moderno"
                  fill
                  className="object-cover"
                  onError={hideMissingImage}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              )}
              {hasAsset("/assets/img/processo-inteligente-empresas.jpg") && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/75 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
                  Ilustração gerada por IA
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <p className="text-xs text-white/90 font-mono">
                  Soluções desenhadas para a realidade prática de negócios brasileiros.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
