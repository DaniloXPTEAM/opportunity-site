"use client";

import { TECH_STACK } from "@/data/portfolio";
import { Cpu, Database, Network, ShieldCheck, UserCheck, Smartphone, Check, Lock, Terminal } from "lucide-react";

export function Technology() {
  const channelList = [
    { name: "WhatsApp", desc: "API Oficial com respostas instantâneas" },
    { name: "Site & Web App", desc: "Agente Adaptativo residente ou widget flutuante" },
    { name: "Interfaces de Voz", desc: "Síntese neural de voz com latência reduzida" },
    { name: "E-mail Corporativo", desc: "Triagem e minutas automáticas de resposta" },
    { name: "Aplicativo Android", desc: "Projetos integrados como Gabi com avatar 3D" }
  ];

  return (
    <section id="tecnologia" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Arquitetura & Engenharia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
            IA conectada às ferramentas do seu negócio.
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg leading-relaxed">
            Agentes, modelos de linguagem, APIs, automações e integração com sistemas legados, construídos com
            rigor técnico, transparência sobre o estado real das parcerias e controle humano obrigatório.
          </p>
        </div>

        {/* Architecture Pipeline Diagram */}
        <div className="bg-slate-800/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>pipeline.diagram // como um agente funciona por dentro</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Supervisão humana ativa (Human-in-the-loop)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Input Channels */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                01. Entrada Multicanal
              </span>
              <h4 className="text-base font-bold text-white">Mensagem Recebida</h4>
              <p className="text-xs text-slate-400">
                O cliente envia texto, áudio ou comando pelo WhatsApp, site, app Android ou e-mail.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">WhatsApp</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Web</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Voz</span>
              </div>
            </div>

            {/* Step 2: Context & Business Rules */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                02. Inteligência & Regras
              </span>
              <h4 className="text-base font-bold text-white">Interpretação & RAG</h4>
              <p className="text-xs text-slate-400">
                O modelo consulta a base de conhecimento restrita da sua marca, preços, tabelas e horários reais.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Prompting</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Vetores</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Sem Alucinação</span>
              </div>
            </div>

            {/* Step 3: Tool Execution */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                03. Ações & Integrações
              </span>
              <h4 className="text-base font-bold text-white">Execução de Ações</h4>
              <p className="text-xs text-slate-400">
                Consulta saldo no CRM, agenda horário no Google Calendar, gera link de pagamento ou atualiza status.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">CRM REST</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">Webhooks</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">PIX</span>
              </div>
            </div>

            {/* Step 4: Output & Human Escalation */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                04. Resposta ou Humano
              </span>
              <h4 className="text-base font-bold text-white">Transição Fluida</h4>
              <p className="text-xs text-slate-400">
                O cliente recebe resposta em segundos. Se o caso for sensível, um atendente humano assume na hora.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-[10px] font-mono text-cyan-300">
                  1-Click Escalation
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono text-emerald-300">
                  Logs LGPD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Technology Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECH_STACK.map((tech, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-800/60 border border-white/10 hover:border-cyan-400/40 transition-colors space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 text-cyan-400 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white font-display">{tech.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>

        {/* Real Partnerships & Integrations Legal Notice */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-white/10 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Transparência Operacional:</strong> Nomes de terceiros (como WhatsApp, Meta, Google, OpenAI e
            Android) são citados exclusivamente para indicar compatibilidade de arquitetura e protocolos de integração.
            A Opportunity AI mantém conformidade rigorosa com os termos de serviço e políticas de privacidade de cada
            plataforma parceira.
          </p>
        </div>
      </div>
    </section>
  );
}
