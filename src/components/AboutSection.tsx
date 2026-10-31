"use client";

import { useState } from "react";
import { Minus, Plus, MapPin } from "lucide-react";
import { SectionHeader } from "@/components/ui";

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
    <section id="sobre" className="section bg-white">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="Sobre a Opportunity AI" title="Tecnologia aplicada a problemas reais de pequenos negócios." />
            <div className="mt-8 max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-slate-600">
              <p>
                A <strong className="font-semibold text-ink">Opportunity AI</strong> desenvolve soluções digitais, automações e
                agentes de inteligência artificial para micro, pequenas e médias empresas. O trabalho começa pelo problema do
                negócio, não pela tecnologia.
              </p>
              <p>
                Além das soluções comerciais, mantemos o <strong className="font-semibold text-ink">Opportunity Labs</strong>,
                onde testamos formatos que ainda não têm lugar óbvio no mercado: plataformas para comunidades, ferramentas de
                criação e jogos. É onde a curiosidade vira protótipo.
              </p>
            </div>

            <div className="mt-12 grid gap-10 border-t border-slate-200 pt-8 sm:grid-cols-2">
              <div>
                <h3 className="t-h3">Propósito</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">
                  Tornar automação e inteligência artificial compreensíveis e úteis para quem toca um negócio pequeno, com
                  linguagem simples e expectativa realista.
                </p>
              </div>
              <div>
                <h3 className="t-h3">Como trabalhamos</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">
                  Dizemos o que está pronto, o que está em desenvolvimento e o que não faz sentido no seu caso. Se a solução não
                  for viável, isso é dito na primeira conversa.
                </p>
              </div>
            </div>
          </div>

          <aside className="on-dark bg-ink p-8 text-white sm:p-10 lg:col-span-5 lg:self-start" aria-label="Quem está por trás">
            <p className="eyebrow">Quem está por trás</p>
            <p className="mt-6 font-display text-3xl font-semibold leading-tight">Danilo de Vasconcelos Silva</p>
            <p className="mt-1 text-sm text-slate-300">Nome social: Rafael Nobre</p>
            <p className="mt-4 text-base font-semibold text-accent">Fundador e CEO</p>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-slate-300">
              A Opportunity AI trabalha com desenvolvimento de software e inteligência artificial aplicada, do primeiro
              diagnóstico ao funcionamento no dia a dia.
            </p>
            <a
              href="https://www.linkedin.com/in/danilo-de-vasconcelos-silva-b4296552"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-[0.9375rem] font-semibold underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent"
            >
              LinkedIn do fundador
            </a>
            <div className="mt-8 flex items-center gap-2 border-t border-white/15 pt-5 text-sm text-slate-300">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              <span>Fortaleza · Ceará · atendimento remoto</span>
            </div>
          </aside>
        </div>

        {/* Documentos legais preservados */}
        <div className="mt-24 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="t-h3">Documentos</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenLegal(openLegal === "privacidade" ? null : "privacidade")}
                className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-blue-700"
              >
                <span>Política de Privacidade</span>
                {openLegal === "privacidade" ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <button
                onClick={() => setOpenLegal(openLegal === "termos" ? null : "termos")}
                className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-blue-700"
              >
                <span>Termos de Uso</span>
                {openLegal === "termos" ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {openLegal === "privacidade" && (
            <div className="mt-6 max-w-3xl space-y-3 border-l-2 border-slate-300 pl-5 text-[0.9375rem] leading-relaxed text-slate-600">
              <h4 className="font-semibold text-ink">Política de Privacidade</h4>
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
            <div className="mt-6 max-w-3xl space-y-3 border-l-2 border-slate-300 pl-5 text-[0.9375rem] leading-relaxed text-slate-600">
              <h4 className="font-semibold text-ink">Termos de Uso</h4>
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
