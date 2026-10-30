"use client";

import { asset } from "@/lib/asset";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  /** Seção visível no momento, usada para marcar o item ativo do menu. */
  currentSection?: string;
}

/**
 * Menu principal.
 *
 * Antes eram 8 itens em um cabeçalho raso, alguns apontando para blocos que se
 * repetiam ("Projetos em Destaque", "Catálogo Completo", "Soluções",
 * "Tecnologia"). Agora são 6 itens — um para cada seção real da página — mais o
 * botão "Fale sobre seu projeto". O item ativo acompanha a rolagem.
 */
export function Header({ onNavigate, currentSection = "inicio" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Início", id: "inicio" },
    { label: "Soluções", id: "solucoes" },
    { label: "Projetos", id: "destaques" },
    { label: "Agente Adaptativo", id: "agente" },
    { label: "Sobre", id: "sobre" },
    { label: "Contato", id: "contato" },
  ];

  /**
   * Fecha o menu antes de navegar.
   *
   * No celular, abrir o menu empurra o conteúdo para baixo (o painel é montado
   * no topo). Navegar no mesmo evento fazia o cálculo da posição acontecer com
   * o layout antigo — o menu fechava depois e a página parava alguns milhares
   * de pixels depois do alvo. Esperar um quadro resolve.
   */
  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => onNavigate(id)));
  };

  /** Marca o item ativo: o catálogo pertence ao bloco de projetos. */
  const ativo = (id: string) => {
    if (id === "destaques") return currentSection === "destaques" || currentSection === "projetos";
    return currentSection === id;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/95 py-2.5 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-white/80 py-4 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Marca */}
        <button onClick={() => handleNavClick("inicio")} className="group flex shrink-0 items-center gap-2.5 text-left">
          <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-blue-500/20 transition-transform group-hover:scale-105">
            <Image
              src={asset("/assets/img/logo-mark.png")}
              alt="Opportunity AI"
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">
            Opportunity <span className="text-blue-600">AI</span>
          </span>
        </button>

        {/* Navegação (desktop) */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50/80 p-1 text-[13px] font-medium lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={ativo(item.id) ? "true" : undefined}
              className={`rounded-full px-3.5 py-1.5 transition-all ${
                ativo(item.id)
                  ? "bg-white font-semibold text-blue-700 shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {/* Acesso ao atendente do site (substitui o antigo botão flutuante) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-kirana"))}
            className="hidden items-center gap-2 rounded-full border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 md:inline-flex"
            aria-label="Abrir atendente digital"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Atendente digital</span>
          </button>

          <button
            onClick={() => handleNavClick("contato")}
            className="hidden items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 sm:inline-flex sm:text-sm"
          >
            <span>Fale sobre seu projeto</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-5 shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium ${
                  ativo(item.id) ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent("open-kirana"));
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Atendente digital</span>
          </button>

          <button
            onClick={() => handleNavClick("contato")}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
          >
            <span>Fale sobre seu projeto</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
