"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { LAB_PROJECTS, ProjectItem, GrupoProjeto } from "@/data/portfolio";
import { ArrowUpRight, X } from "lucide-react";
import { hasAsset, hideMissingImage } from "@/lib/media";
import { SectionHeader } from "@/components/ui";
import { CarrosselProjetos } from "@/components/CarrosselProjetos";

interface PortfolioProps {
  onSelectProject: (p: ProjectItem) => void;
  selectedProjectModal: ProjectItem | null;
  onCloseModal: () => void;
  /** Abre o atendente do site (o Agente Adaptativo é experimentado conversando com a Kirana). */
  onAbrirAtendente: () => void;
}

/**
 * Catálogo do Opportunity Labs.
 *
 * Uma única grade com filtro por natureza (antes eram cinco grupos com 1 a 3 cartões cada,
 * deixando metade da tela vazia). As imagens aparecem inteiras (nunca cortadas); o estado
 * ("Ativo") é explicado uma vez, na legenda, e marcado de forma discreta em cada cartão.
 */
const GRUPOS: { id: GrupoProjeto; titulo: string; descricao: string }[] = [
  {
    id: "empresariais",
    titulo: "Soluções empresariais",
    descricao: "CRM, agentes de atendimento e ferramentas comerciais pensadas para o dia a dia de uma empresa.",
  },
  {
    id: "criacao",
    titulo: "Produtos digitais e criação",
    descricao: "Ferramentas de produção de conteúdo, imagem e audiovisual.",
  },
  {
    id: "plataformas",
    titulo: "Plataformas e comunidades",
    descricao: "Sistemas sociais e experiências colaborativas para grupos e comunidades.",
  },
  {
    id: "jogos",
    titulo: "Jogos e experiências",
    descricao: "Mundos, mesas virtuais e sistemas de jogo construídos do zero.",
  },
  {
    id: "pesquisa",
    titulo: "Pesquisa e experimentos",
    descricao: "Formatos ainda em teste: servem para aprender, não para contratar.",
  },
];

function Estado({ estado }: { estado: string }) {
  const cor = estado === "Ativo" || estado === "Disponível" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
      <span className={`h-2 w-2 rounded-full ${cor}`} aria-hidden="true" />
      {estado}
    </span>
  );
}

export function Portfolio({ onSelectProject, selectedProjectModal, onCloseModal, onAbrirAtendente }: PortfolioProps) {
  const [filtro, setFiltro] = useState<GrupoProjeto | "todos">("todos");
  const visiveis = LAB_PROJECTS.filter((p) => filtro === "todos" || p.grupo === filtro);
  const grupoAtivo = GRUPOS.find((g) => g.id === filtro);
  const aberto = selectedProjectModal !== null;

  // Esc fecha o detalhe (a página não rola enquanto ele está aberto).
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onCloseModal();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, onCloseModal]);

  const abrirPorTeclado = (e: KeyboardEvent<HTMLElement>, p: ProjectItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectProject(p);
    }
  };

  const filtros: { id: GrupoProjeto | "todos"; titulo: string; n: number }[] = [
    { id: "todos", titulo: "Todos", n: LAB_PROJECTS.length },
    ...GRUPOS.map((g) => ({ id: g.id, titulo: g.titulo, n: LAB_PROJECTS.filter((p) => p.grupo === g.id).length })).filter(
      (g) => g.n > 0,
    ),
  ];

  const m = selectedProjectModal;

  return (
    <section id="projetos" className="section bg-white">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <SectionHeader
            className="lg:col-span-8"
            eyebrow="Opportunity Labs · catálogo completo"
            title="O que está sendo construído."
            lead="Estes são os projetos que a Opportunity AI desenvolve além das soluções para empresas. Todos estão ativos: em andamento e mantidos pela equipe."
          />
          <p className="border-l-2 border-accent pl-4 text-[0.9375rem] text-slate-600 lg:col-span-4">
            Quer usar um deles no seu negócio, ou uma solução parecida? Conte o seu caso: escopo e prazo são definidos na
            conversa, antes de qualquer compromisso.
          </p>
        </div>

        {/* Filtro por natureza */}
        <div className="mt-12 border-b border-slate-200">
          <div className="-mb-px flex gap-7 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filtrar projetos">
            {filtros.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filtro === f.id}
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 border-b-2 py-3 text-[0.9375rem] font-semibold transition-colors ${
                  filtro === f.id ? "border-accent text-ink" : "border-transparent text-slate-500 hover:text-ink"
                }`}
              >
                {f.titulo} <span className="font-normal text-slate-400">{f.n}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 min-h-6 text-sm text-slate-500">{grupoAtivo ? grupoAtivo.descricao : "Todos os projetos do laboratório."}</p>

        {/* Carrossel de cartões */}
        <CarrosselProjetos key={filtro} itens={visiveis} onAbrir={onSelectProject} onAbrirAtendente={onAbrirAtendente} />

        {/* Detalhe do projeto */}
        {m && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-3 sm:p-6"
            onClick={onCloseModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${m.title}`}
          >
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-[16/9] max-h-[22rem] w-full bg-ink">
                {hasAsset(m.img) && (
                  <Image src={m.img} alt={m.title} fill className="object-contain" sizes="(max-width: 896px) 100vw, 896px" onError={hideMissingImage} />
                )}
                <button
                  onClick={onCloseModal}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-white text-ink hover:bg-accent"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-9 p-6 sm:p-10">
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-sm font-semibold text-blue-700">{m.category}</p>
                    <Estado estado={m.estado} />
                  </div>
                  <h3 className="t-h2 mt-3 !text-[clamp(1.9rem,1.4rem+1.6vw,2.75rem)]">{m.title}</h3>
                  <p className="t-lead mt-3 !max-w-none">{m.lead}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-ink">Sobre o projeto</h4>
                  <p className="mt-2 leading-relaxed text-slate-600">{m.fullDesc}</p>
                </div>

                <div className="grid gap-10 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Recursos e funcionalidades</h4>
                    <ul className="mt-3 space-y-2.5 text-[0.9375rem] text-slate-600">
                      {m.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span className="mt-[0.75em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Ficha técnica</h4>
                    <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-[0.9375rem]">
                      {m.specs.map((s) => (
                        <div key={s.label} className="flex justify-between gap-4 py-2.5">
                          <dt className="text-slate-500">{s.label}</dt>
                          <dd className="text-right font-semibold text-ink">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                {m.aviso && <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-slate-600">{m.aviso}</p>}

                {m.galleryImgs && m.galleryImgs.length > 1 && (
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Capturas e imagens</h4>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {m.galleryImgs.filter(hasAsset).map((imgUrl, i) => (
                        <div key={i} className="relative aspect-[4/3] bg-ink">
                          <Image
                            src={imgUrl}
                            alt={`Captura ${i + 1} de ${m.title}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 50vw, 280px"
                            onError={hideMissingImage}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                  <span className="text-sm text-slate-500">Opportunity Labs · {m.estado}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={onCloseModal} className="btn btn-line !py-2.5">
                      Fechar
                    </button>
                    {m.acessoUrl && (
                      <a href={m.acessoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark !py-2.5">
                        <span>Acessar o projeto</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    <a href="#contato" onClick={onCloseModal} className="btn btn-primary !py-2.5">
                      Conversar sobre este projeto
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
