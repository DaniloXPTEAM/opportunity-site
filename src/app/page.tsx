"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SolutionsForBusiness } from "@/components/SolutionsForBusiness";
import { DiagonalShowcase } from "@/components/DiagonalShowcase";
import { AgentDemo } from "@/components/AgentDemo";
import { Portfolio } from "@/components/Portfolio";
import { HowWeWork } from "@/components/HowWeWork";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { AtendenteSite } from "@/components/AtendenteSite";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { AtendenteFlutuante } from "@/components/AtendenteFlutuante";
import { ProjectItem } from "@/data/portfolio";

/**
 * Ordem das seções — reorganizada para a jornada comercial:
 *
 *  1. inicio     → o que fazemos (problema → solução, em 5 segundos)
 *  2. solucoes   → problemas reais de pequenos negócios (oferta principal)
 *  3. destaques  → projetos em destaque (componente aprovado, preservado)
 *  4. agente     → demonstração do Agente Adaptativo (claramente demonstração)
 *  5. projetos   → catálogo por natureza e maturidade
 *  6. processo   → como trabalhamos (consolida metodologia + arquitetura)
 *  7. sobre      → seção institucional única
 *  8. contato    → formulário integrado ao WhatsApp
 */
const SECTIONS = ["inicio", "solucoes", "destaques", "agente", "projetos", "processo", "sobre", "contato"];

export default function Home() {
  const [residentKiranaOpen, setResidentKiranaOpen] = useState(false);
  const [selectedProjectModal, setSelectedProjectModal] = useState<ProjectItem | null>(null);
  const [currentSection, setCurrentSection] = useState("inicio");

  // Abertura do atendente por evento (usada pelo botão do painel de demonstração)
  useEffect(() => {
    const handleOpen = () => setResidentKiranaOpen(true);
    window.addEventListener("open-kirana", handleOpen);
    return () => window.removeEventListener("open-kirana", handleOpen);
  }, []);

  /**
   * Seção visível — usada pelo menu (item ativo), pelo botão flutuante
   * (esconde na seção de demonstração, que já tem o próprio convite) e como
   * contexto da Kirana. A ponte seção → rota fica em `src/lib/kirana.ts`.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel?.target.id && SECTIONS.includes(visivel.target.id)) {
          setCurrentSection(visivel.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setCurrentSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Motion />
      <Header onNavigate={handleNavigate} currentSection={currentSection} />

      <main id="conteudo">
        <Hero onNavigate={handleNavigate} />

        <SolutionsForBusiness onNavigate={handleNavigate} />

        {/* Projetos em Destaque — componente e interações preservados */}
        <DiagonalShowcase onSelectProject={(p) => setSelectedProjectModal(p)} onNavigate={handleNavigate} />

        <AgentDemo
          onOpenResidentKirana={() => setResidentKiranaOpen(true)}
          onNavigate={handleNavigate}
        />

        <Portfolio
          onSelectProject={(p) => setSelectedProjectModal(p)}
          selectedProjectModal={selectedProjectModal}
          onCloseModal={() => setSelectedProjectModal(null)}
        />

        <HowWeWork onNavigate={handleNavigate} />

        <AboutSection />

        <ContactSection />
      </main>

      <Footer onNavigate={handleNavigate} onOpenKirana={() => setResidentKiranaOpen(true)} />

      {/* Acesso fixo ao atendente (canto inferior direito) e painel do atendente do site. */}
      <AtendenteFlutuante visivel={!residentKiranaOpen && !selectedProjectModal} onAbrir={() => setResidentKiranaOpen(true)} />
      <AtendenteSite
        isOpen={residentKiranaOpen}
        onClose={() => setResidentKiranaOpen(false)}
        onNavigate={handleNavigate}
        onSelectProject={(p) => setSelectedProjectModal(p)}
        currentSection={currentSection}
      />
    </div>
  );
}
