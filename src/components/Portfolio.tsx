"use client";

import Image from "next/image";
import { LAB_PROJECTS, ProjectItem, GrupoProjeto, EstadoProjeto } from "@/data/portfolio";
import { ArrowRight, Check, X, ChevronDown } from "lucide-react";
import { hasAsset, hideMissingImage } from "@/lib/media";

const ehIlustrativa = (p: ProjectItem, img: string) => !!p.imgsIlustrativas?.includes(img);

function EtiquetaIlustrativa({ curta = false }: { curta?: boolean }) {
  return (
    <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full bg-slate-900/75 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
      {curta ? "IA" : "Ilustração gerada por IA"}
    </span>
  );
}

interface PortfolioProps {
  onSelectProject: (p: ProjectItem) => void;
  selectedProjectModal: ProjectItem | null;
  onCloseModal: () => void;
}

/**
 * Catálogo do laboratório — organizado por natureza e por maturidade.
 *
 * Antes era uma grade única de 9 cartões iguais, com filtros por tipo de mídia
 * ("Gestão & CRM", "RPG & Games") que não diziam nada sobre o estado real de
 * cada projeto — e dava a impressão de que os nove eram produtos prontos para
 * contratar. Agora:
 *
 *   - cada grupo tem nome, descrição e contagem;
 *   - o estado (hoje "Ativo" em todos) aparece no cartão;
 *   - nenhum projeto é marcado como "Disponível" sem validação em produção;
 *   - os 9 projetos continuam todos aqui, sem funcionalidade inventada.
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
    titulo: "Jogos e experiências interativas",
    descricao: "Mundos, mesas virtuais e sistemas de jogo construídos do zero.",
  },
  {
    id: "pesquisa",
    titulo: "Pesquisa e experimentos",
    descricao: "Formatos ainda em teste — servem para aprender, não para contratar.",
  },
];

/** Cor de cada estado — o mesmo código visual em todo o site. */
const COR_ESTADO: Record<EstadoProjeto, string> = {
  Ativo: "bg-emerald-600 text-white border-emerald-300",
  Conceito: "bg-slate-800 text-white border-white/20",
  "Em desenvolvimento": "bg-amber-500 text-slate-950 border-amber-300",
  Demonstração: "bg-sky-600 text-white border-sky-300",
  Disponível: "bg-emerald-600 text-white border-emerald-300",
};

const ORDEM_GRUPOS = GRUPOS.map((g) => g.id);

export function Portfolio({ onSelectProject, selectedProjectModal, onCloseModal }: PortfolioProps) {
  const porGrupo = (g: GrupoProjeto) => LAB_PROJECTS.filter((p) => p.grupo === g);

  return (
    <section id="projetos" className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
              Opportunity Labs · catálogo completo
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl font-display">
              O que está sendo construído.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Estes são os projetos que a Opportunity AI desenvolve além das soluções para empresas. Todos estão
              ativos: em andamento e mantidos pela equipe.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Quer usar um deles no seu negócio, ou uma solução parecida? Conte o seu caso: escopo e prazo são definidos
              na conversa, antes de qualquer compromisso.
            </p>
          </div>

          {/* Legenda de estados */}
          <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Estado</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Ativo — em andamento, mantido pela equipe
              </li>
            </ul>
          </div>
        </div>

        {/* Grupos por natureza */}
        <div className="mt-14 space-y-14">
          {ORDEM_GRUPOS.map((gid) => {
            const grupo = GRUPOS.find((g) => g.id === gid)!;
            const projetos = porGrupo(gid);
            if (!projetos.length) return null;

            return (
              <div key={gid}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-200 pb-3">
                  <h3 className="text-xl font-bold text-slate-900 font-display sm:text-2xl">{grupo.titulo}</h3>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {projetos.length} {projetos.length === 1 ? "projeto" : "projetos"}
                  </span>
                  <p className="w-full text-sm text-slate-500 sm:w-auto">{grupo.descricao}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {projetos.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => onSelectProject(item)}
                      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-xl"
                    >
                      {/* Capa: usa a captura real quando existe; senão, o gradiente do projeto */}
                      <div className={`relative h-44 w-full shrink-0 overflow-hidden bg-gradient-to-br ${item.accentColor}`}>
                        {hasAsset(item.img) ? (
                          <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            onError={hideMissingImage}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          /* Sem captura no pacote: composição de identidade do
                             próprio projeto (monograma + área) sobre o gradiente
                             da paleta. Discreta, coerente com o cartão e sem
                             simular uma tela que não existe. */
                          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3">
                            <div
                              className="absolute inset-0 opacity-[0.12]"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                                backgroundSize: "22px 22px",
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 font-display text-xl font-black tracking-tight text-white ring-1 ring-white/25 backdrop-blur-sm">
                              {item.title.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="relative h-px w-10 bg-white/30" />
                            <span className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                              {item.category}
                            </span>
                          </div>
                        )}
                        {hasAsset(item.img) && ehIlustrativa(item, item.img) && <EtiquetaIlustrativa />}
                        <div className="absolute left-3 top-3">
                          <span
                            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${COR_ESTADO[item.estado]}`}
                          >
                            {item.estado}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </p>
                          <h4 className="mt-1 text-lg font-bold leading-snug text-slate-900 font-display group-hover:text-blue-700">
                            {item.title}
                          </h4>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">{item.lead}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                            Ver detalhes
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota de transparência */}
        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs leading-relaxed text-slate-600">
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 rotate-[-90deg] text-slate-400" />
          <p>
            As imagens são capturas das telas dos projetos. As marcadas como &quot;Ilustração gerada por IA&quot; são
            ilustrações ou conceitos visuais, não capturas reais do produto. Onde não há imagem, o cartão mostra apenas
            a identidade visual do próprio projeto. Projetos conceituais e experimentais estão separados das soluções comerciais justamente para não confundir o
            que já pode ser contratado.
          </p>
        </div>

        {/* Modal de detalhe */}
        {selectedProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="relative h-56 w-full bg-slate-900 sm:h-72">
                {hasAsset(selectedProjectModal.img) && (
                  <Image
                    src={selectedProjectModal.img}
                    alt={selectedProjectModal.title}
                    fill
                    className="object-cover object-top"
                    sizes="100vw"
                    onError={hideMissingImage}
                  />
                )}
                {hasAsset(selectedProjectModal.img) && ehIlustrativa(selectedProjectModal, selectedProjectModal.img) && (
                  <EtiquetaIlustrativa />
                )}
                <button
                  onClick={onCloseModal}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase ${COR_ESTADO[selectedProjectModal.estado]}`}
                  >
                    {selectedProjectModal.estado}
                  </span>
                  <span className="rounded-full bg-white/95 px-3 py-1 font-mono text-xs font-semibold text-slate-800">
                    {selectedProjectModal.category}
                  </span>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-display sm:text-3xl">
                    {selectedProjectModal.title}
                  </h3>
                  <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                    {selectedProjectModal.lead}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  <h4 className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                    Sobre o projeto
                  </h4>
                  <p>{selectedProjectModal.fullDesc}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                      Recursos e funcionalidades
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600 sm:text-sm">
                      {selectedProjectModal.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                      Ficha técnica
                    </h4>
                    <div className="space-y-2">
                      {selectedProjectModal.specs.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                        >
                          <span className="font-medium text-slate-500">{s.label}:</span>
                          <span className="font-bold text-slate-800">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedProjectModal.galleryImgs && selectedProjectModal.galleryImgs.length > 1 && (
                  <div>
                    <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                      Capturas e imagens
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedProjectModal.galleryImgs.filter(hasAsset).map((imgUrl, i) => (
                        <div
                          key={i}
                          className="relative h-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                        >
                          <Image
                            src={imgUrl}
                            alt={
                              ehIlustrativa(selectedProjectModal, imgUrl)
                                ? `Ilustração gerada por IA de ${selectedProjectModal.title}`
                                : `Captura ${i + 1} de ${selectedProjectModal.title}`
                            }
                            fill
                            className="object-cover"
                            onError={hideMissingImage}
                          />
                          {ehIlustrativa(selectedProjectModal, imgUrl) && <EtiquetaIlustrativa curta />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <span className="font-mono text-xs text-slate-500">
                    Opportunity Labs · {selectedProjectModal.estado}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onCloseModal}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Fechar
                    </button>
                    {selectedProjectModal.acessoUrl && (
                      <a
                        href={selectedProjectModal.acessoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Acessar o projeto
                      </a>
                    )}
                    <a
                      href="#contato"
                      onClick={onCloseModal}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                    >
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
