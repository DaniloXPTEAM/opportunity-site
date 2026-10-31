"use client";

import { asset } from "@/lib/asset";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  /** Seção visível no momento, usada para marcar o item ativo do menu. */
  currentSection?: string;
}

/**
 * Menu principal: seis itens, um para cada seção real da página, mais a chamada
 * "Fale com a equipe". Barra branca com linha fina; o item ativo acompanha a rolagem.
 */
export function Header({ onNavigate, currentSection = "inicio" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
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
   * Fecha o menu antes de navegar: no celular o painel empurra o conteúdo, e navegar
   * no mesmo evento calculava a posição com o layout antigo. Esperar um quadro resolve.
   */
  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => onNavigate(id)));
  };

  /** O catálogo pertence ao bloco de projetos. */
  const ativo = (id: string) => {
    if (id === "destaques") return currentSection === "destaques" || currentSection === "projetos";
    return currentSection === id;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 bg-white transition-shadow ${
        scrolled ? "border-b border-slate-200 shadow-[0_1px_0_rgba(10,20,40,0.04)]" : "border-b border-transparent"
      }`}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <button onClick={() => handleNavClick("inicio")} className="flex shrink-0 items-center gap-3 text-left">
          <span className="relative h-9 w-9 overflow-hidden rounded-full">
            <Image src={asset("/assets/img/logo-mark.png")} alt="Opportunity AI" fill className="object-cover" sizes="36px" priority />
          </span>
          <span className="font-display text-[1.35rem] font-semibold leading-none tracking-tight text-ink">
            Opportunity <span className="text-blue-600">AI</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 text-[0.9375rem] font-medium lg:flex" aria-label="Principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={ativo(item.id) ? "true" : undefined}
              className={`relative py-2 transition-colors ${
                ativo(item.id)
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px] after:bg-accent"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => handleNavClick("contato")} className="btn btn-primary hidden !py-2.5 sm:inline-flex">
            <span>Fale com a equipe</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-ink hover:bg-slate-100 lg:hidden"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <div className="wrap py-4">
            <div className="divide-y divide-slate-100">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between py-3.5 text-left text-base font-medium ${
                    ativo(item.id) ? "text-blue-700" : "text-ink"
                  }`}
                >
                  <span>{item.label}</span>
                  {ativo(item.id) && <span className="h-2 w-2 rounded-full bg-accent" />}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <button onClick={() => handleNavClick("contato")} className="btn btn-primary w-full">
                <span>Fale com a equipe</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
