"use client";

import { asset } from "@/lib/asset";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Sparkles, ShieldCheck } from "lucide-react";
import { LAB_PROJECTS, ProjectItem } from "@/data/portfolio";

interface DiagonalShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
  onNavigate: (sectionId: string) => void;
}

export function DiagonalShowcase({ onSelectProject, onNavigate }: DiagonalShowcaseProps) {
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  const pKirana = LAB_PROJECTS.find((p) => p.id === "kirana")!;
  const pArmada = LAB_PROJECTS.find((p) => p.id === "mesa-vtt")!;
  const pMorden = LAB_PROJECTS.find((p) => p.id === "mordenrpg")!;

  return (
    <section id="destaques" className="relative bg-[#faf7f2] py-20 lg:py-28 text-slate-900 overflow-hidden">
      {/* Editorial subtle warm background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5dfd3_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        {/* TOP ROW: Editorial Headline & Presentation matching Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase">
              PRODUTOS DIGITAIS COM PROPÓSITO
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight leading-[0.98] font-display text-slate-950 uppercase">
              TECNOLOGIA <br />
              QUE ABRE <br />
              <span className="text-[#b47a52]">NOVAS HISTÓRIAS.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pt-6">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Da inteligência artificial às plataformas de RPG, criamos experiências digitais que conectam pessoas,
              ideias e oportunidades.
            </p>

            <div>
              <button
                onClick={() => onNavigate("projetos")}
                className="group inline-flex items-center gap-3 text-sm font-semibold text-slate-900 hover:text-[#b47a52] transition-colors"
              >
                <span className="w-11 h-11 rounded-full border border-slate-300 group-hover:border-[#b47a52] flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-white shadow-xs">
                  <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-[#b47a52] group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span>Conheça nossos produtos</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE COMPOSITION: ASYMMETRIC TRAPEZOIDAL PANELS */}
        <div className="relative w-full">
          {/* Desktop & Tablet Asymmetric Trapezoid Mosaic */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 h-[580px] lg:h-[620px] select-none">
            {/* PANEL 1: KIRANA (Left Big Trapezoid with Diagonal Top/Right Slope) */}
            <div
              onMouseEnter={() => setHoveredPanel("kirana")}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => onSelectProject(pKirana)}
              className={`col-span-6 relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out transform ${
                hoveredPanel === "kirana"
                  ? "scale-[1.025] z-30 shadow-2xl ring-2 ring-emerald-400/40"
                  : hoveredPanel !== null
                  ? "scale-[0.985] opacity-90 z-10"
                  : "z-10 shadow-xl"
              }`}
              style={{
                clipPath: "polygon(0 0, 100% 4%, 88% 100%, 0 100%)",
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Background Image: High resolution editorial Kirana */}
              {/* Composição de múltiplas identidades: o produto é o agente
                  adaptativo, não uma única atendente. Reaproveita as capturas
                  reais dos showcases (site, WhatsApp/CRM, RPG, app, esfera). */}
              <Image
                src={asset("/assets/img/hero-agent-adaptive.jpg")}
                alt="Agente Adaptativo - três identidades do mesmo agente e telas de CRM, jogo e aplicativo"
                fill
                priority
                className={`object-cover object-[center_20%] transition-transform duration-1000 ease-out ${
                  hoveredPanel === "kirana" ? "scale-110" : "scale-100"
                }`}
                sizes="(max-width: 1024px) 50vw, 40vw"
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-slate-950/20" />

              {/* Badge & Authenticity Info */}
              <div className="absolute top-6 left-6 z-20">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                  Agente Adaptativo
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-8 left-8 right-16 z-20 space-y-3">
                <h3 className="text-3xl lg:text-4xl font-black text-white font-display tracking-tight drop-shadow-md">
                  Agente Adaptativo
                </h3>
                <p className="text-sm lg:text-base text-slate-200 max-w-sm leading-relaxed drop-shadow-sm">
                  Agente de IA que assume diferentes identidades, personalidades e funções para atuar em
                  sites, aplicativos, atendimento, mensageiros e jogos — usando o conhecimento e as
                  ferramentas de cada ambiente. Aqui ele atende como <strong className="text-white">Kirana</strong>.
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold transition-all group-hover:border-white">
                    <span>Saiba mais</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 2 Slanted Stacked Trapezoids (Armada Nexus & MordenRPG) */}
            <div className="col-span-6 flex flex-col gap-4 h-full relative">
              {/* PANEL 2: ARMADA NEXUS (Top Right Slanted Trapezoid) */}
              <div
                onMouseEnter={() => setHoveredPanel("armada")}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={() => onSelectProject(pArmada)}
                className={`flex-1 relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out transform ${
                  hoveredPanel === "armada"
                    ? "scale-[1.03] z-30 shadow-2xl ring-2 ring-amber-400/50"
                    : hoveredPanel !== null
                    ? "scale-[0.985] opacity-90 z-10"
                    : "z-10 shadow-xl"
                }`}
                style={{
                  clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0 94%)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                <Image
                  src={asset("/assets/img/armada-nexus-2.jpg")}
                  alt="Armada Nexus - Plataforma virtual de RPG completa"
                  fill
                  className={`object-cover object-center transition-transform duration-1000 ease-out ${
                    hoveredPanel === "armada" ? "scale-110" : "scale-100"
                  }`}
                  sizes="(max-width: 1024px) 50vw, 40vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-slate-950/20" />

                <div className="absolute top-5 left-8 z-20">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                    VTT · Mesa Virtual
                  </span>
                </div>

                <div className="absolute bottom-6 left-8 right-6 z-20 space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight drop-shadow-md">
                    Armada Nexus
                  </h3>
                  <p className="text-xs lg:text-sm text-slate-200 leading-relaxed max-w-xs drop-shadow-sm">
                    Plataforma virtual de RPG completa com mapas táticos e rolagens 3D.
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold transition-all">
                      <span>Explorar</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* PANEL 3: MORDENRPG (Bottom Right Slanted Trapezoid) */}
              <div
                onMouseEnter={() => setHoveredPanel("morden")}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={() => onSelectProject(pMorden)}
                className={`flex-1 relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out transform ${
                  hoveredPanel === "morden"
                    ? "scale-[1.03] z-30 shadow-2xl ring-2 ring-cyan-400/50"
                    : hoveredPanel !== null
                    ? "scale-[0.985] opacity-90 z-10"
                    : "z-10 shadow-xl"
                }`}
                style={{
                  clipPath: "polygon(0 6%, 100% 0, 100% 100%, 7% 100%)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                <Image
                  src={asset("/assets/img/mordenrpg-inicio.jpg")}
                  alt="MordenRPG - RPG online, moderno e focado na experiência"
                  fill
                  className={`object-cover object-center transition-transform duration-1000 ease-out ${
                    hoveredPanel === "morden" ? "scale-110" : "scale-100"
                  }`}
                  sizes="(max-width: 1024px) 50vw, 40vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-slate-950/20" />

                <div className="absolute top-5 left-10 z-20">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-400/30">
                    Comunidade & Fichas
                  </span>
                </div>

                <div className="absolute bottom-6 left-10 right-6 z-20 space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight drop-shadow-md">
                    MordenRPG
                  </h3>
                  <p className="text-xs lg:text-sm text-slate-200 leading-relaxed max-w-xs drop-shadow-sm">
                    RPG online, moderno e focado na experiência do jogador.
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold transition-all">
                      <span>Saiba mais</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Fallback: Elegant Stacked Cards with Diagonal Slices */}
          <div className="md:hidden space-y-4">
            {[pKirana, pArmada, pMorden].map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="relative h-72 rounded-2xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer"
                style={{
                  clipPath:
                    idx === 0
                      ? "polygon(0 0, 100% 3%, 100% 97%, 0 100%)"
                      : idx === 1
                      ? "polygon(0 3%, 100% 0, 100% 100%, 0 97%)"
                      : "polygon(0 0, 100% 3%, 100% 100%, 0 97%)"
                }}
              >
                <Image
                  src={
                    p.id === "kirana"
                      ? asset("/assets/img/hero-agent-adaptive.jpg")
                      : p.id === "mesa-vtt"
                      ? asset("/assets/img/armada-nexus-2.jpg")
                      : asset("/assets/img/mordenrpg-inicio.jpg")
                  }
                  alt={p.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 space-y-1.5 text-white z-10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
                    {idx === 0 ? "Agente Adaptativo · Produto" : p.category}
                  </span>
                  <h3 className="text-2xl font-bold font-display">
                    {idx === 0 ? "Agente Adaptativo" : p.title}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-2">
                    {idx === 0
                      ? "Assume identidades e funções em sites, apps, mensageiros e jogos. Aqui, atende como Kirana."
                      : p.lead}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: Institutional Manifesto matching Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-slate-300/70">
          <div className="lg:col-span-5 space-y-2">
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase">OPPORTUNITY LABS</p>
            <h3 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-950 leading-tight">
              O que esses projetos <br />
              <span className="text-[#b47a52]">demonstram.</span>
            </h3>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="text-base text-slate-700 leading-relaxed font-normal">
              Plataformas completas, agentes de conversa, ferramentas de criação e jogos — todos construídos do zero.
              É a mesma capacidade técnica que atende uma empresa que precisa organizar o atendimento, aplicada a
              problemas diferentes.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate("solucoes")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
              >
                <span>Ver soluções para empresas</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate("projetos")}
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-4"
              >
                Ver o catálogo completo do laboratório →
              </button>
            </div>
          </div>
        </div>

        {/* 4 FEATURE PILLARS matching Reference Image Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#faf7f2] flex items-center justify-center text-slate-800">
              💻
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              Desenvolvimento de produtos digitais
            </h4>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#faf7f2] flex items-center justify-center text-slate-800">
              🧠
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              Inteligência artificial aplicada
            </h4>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#faf7f2] flex items-center justify-center text-slate-800">
              🎲
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              Plataformas e comunidades online
            </h4>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#faf7f2] flex items-center justify-center text-slate-800">
              🛡️
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              Soluções sob medida para o seu negócio
            </h4>
          </div>
        </div>
      </div>
    </section>
  );
}
