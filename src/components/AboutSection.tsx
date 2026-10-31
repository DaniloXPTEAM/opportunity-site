"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Compass, HeartHandshake, MapPin, UserRound } from "lucide-react";

/**
 * Sobre a Opportunity AI — a única seção institucional do site.
 *
 * Saíram: o cartão "CNPJ & Governança Digital" (com domínio, provedor de edge,
 * provedores de IA e a declaração "em conformidade com a LGPD") e a repetição
 * da missão que já aparecia em outras três seções. Nada disso ajudava alguém a
 * decidir se contrata.
 *
 * Entraram: o que a empresa faz, o propósito, em que acredita na prática e quem
 * está por trás — sem inventar credencial, histórico ou dado societário.
 * A Política de Privacidade e os Termos de Uso continuam aqui.
 */
export function AboutSection() {
  const [openLegal, setOpenLegal] = useState<"privacidade" | "termos" | null>(null);

  return (
    <section id="sobre" className="relative overflow-hidden border-b border-slate-200 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Texto institucional */}
          <div className="lg:col-span-7">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
              Sobre a Opportunity AI
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl font-display">
              Tecnologia aplicada a problemas reais de pequenos negócios.
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                A <strong className="text-slate-900">Opportunity AI</strong> desenvolve soluções digitais, automações e
                agentes de inteligência artificial para micro, pequenas e médias empresas. O trabalho começa pelo
                problema do negócio — não pela tecnologia.
              </p>
              <p>
                Além das soluções comerciais, mantemos o{" "}
                <strong className="text-slate-900">Opportunity Labs</strong>, onde testamos formatos que ainda não têm
                lugar óbvio no mercado: plataformas para comunidades, ferramentas de criação e jogos. É onde a
                curiosidade vira protótipo.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Compass className="h-5 w-5 text-blue-600" />
                <h3 className="mt-3 text-sm font-bold text-slate-900 font-display">Propósito</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Tornar automação e inteligência artificial compreensíveis e úteis para quem toca um negócio pequeno —
                  com linguagem simples e expectativa realista.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <HeartHandshake className="h-5 w-5 text-blue-600" />
                <h3 className="mt-3 text-sm font-bold text-slate-900 font-display">Como trabalhamos</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Dizemos o que está pronto, o que está em desenvolvimento e o que não faz sentido no seu caso. Se a
                  solução não for viável, isso é dito na primeira conversa.
                </p>
              </div>
            </div>
          </div>

          {/* Quem está por trás */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-xl">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-cyan-300" />
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  Quem está por trás
                </p>
              </div>

              <div className="mt-5">
                <p className="text-base font-bold text-white">Danilo de Vasconcelos Silva</p>
                <p className="text-xs text-slate-400">Nome social: Rafael Nobre</p>
                <p className="mt-1 text-sm font-semibold text-cyan-200">Fundador e CEO</p>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                A Opportunity AI trabalha com desenvolvimento de software e inteligência artificial aplicada — do
                primeiro diagnóstico ao funcionamento no dia a dia.
              </p>

              <a
                href="https://www.linkedin.com/in/danilo-de-vasconcelos-silva-b4296552"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-xs font-semibold text-cyan-300 hover:underline"
              >
                LinkedIn do fundador
              </a>
              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>Fortaleza · Ceará · atendimento remoto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos legais preservados */}
        <div className="mt-14 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">Documentos</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenLegal(openLegal === "privacidade" ? null : "privacidade")}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <span>Política de Privacidade</span>
                {openLegal === "privacidade" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setOpenLegal(openLegal === "termos" ? null : "termos")}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <span>Termos de Uso</span>
                {openLegal === "termos" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {openLegal === "privacidade" && (
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs leading-relaxed text-slate-600">
              <h4 className="text-sm font-bold text-slate-900">Política de Privacidade</h4>
              <p>
                Os dados enviados pelo formulário de contato (nome, e-mail, telefone e informações sobre a empresa) são
                usados exclusivamente para responder à sua solicitação.
              </p>
              <p>
                Não vendemos, alugamos nem repassamos seus dados para terceiros não autorizados. Você pode pedir a
                exclusão das suas informações a qualquer momento pelos canais de contato do site.
              </p>
              <p>
                As conversas com os agentes em ambiente de demonstração usam dados fictícios. Na versão de avaliação do
                site, o envio do formulário abre o WhatsApp com a mensagem preenchida — os dados passam pelo aplicativo
                do WhatsApp, não por um banco de dados deste site.
              </p>
              <p>
                Não pedimos dados sensíveis. A base legal do tratamento é o seu consentimento, dado ao marcar a caixa do
                formulário. Provedores de infraestrutura que hospedam o site e processam o formulário podem tratar os
                dados em nosso nome.
              </p>
              <p>
                Não usamos cookies de publicidade nem ferramentas de medição de audiência. O atendente digital, na versão
                com servidor, usa apenas um cookie técnico de sessão.
              </p>
              <p>
                Você pode pedir confirmação, acesso, correção, anonimização, eliminação, portabilidade e a revogação do
                consentimento pelo e-mail rafael@opportunity.ia.br. Última atualização: 31 de outubro de 2026.
              </p>
            </div>
          )}

          {openLegal === "termos" && (
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs leading-relaxed text-slate-600">
              <h4 className="text-sm font-bold text-slate-900">Termos de Uso</h4>
              <p>
                Este site tem finalidade informativa e comercial. As demonstrações de atendente digital usam empresas
                fictícias (padaria, pet shop, loja e outros cenários) para ilustrar o funcionamento de um agente.
              </p>
              <p>
                Os projetos do catálogo estão ativos e em evolução. A contratação de qualquer solução ou projeto é
                definida caso a caso, em conversa com a equipe: escopo, prazo e valor são combinados antes de qualquer
                compromisso.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
