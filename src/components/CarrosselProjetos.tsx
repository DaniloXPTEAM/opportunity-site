"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import type { ProjectItem } from "@/data/portfolio";
import { hasAsset, hideMissingImage } from "@/lib/media";
import { asset } from "@/lib/asset";

/** Identidades do mesmo agente, mostradas em sequência no cartão do Agente Adaptativo. */
const IDENTIDADES = [
  { arquivo: "hero-agent-adaptive.jpg", rotulo: "Uma só base, várias identidades" },
  { arquivo: "kirana-1.jpg", rotulo: "Identidade Kirana" },
  { arquivo: "kirana-2.jpg", rotulo: "Identidade Rafael" },
  { arquivo: "kirana-3.jpg", rotulo: "Nova persona" },
];

function ImagemIdentidades({ titulo }: { titulo: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % IDENTIDADES.length), 2600);
    return () => window.clearInterval(t);
  }, []);
  return (
    <>
      {IDENTIDADES.map((id, k) => (
        <Image
          key={id.arquivo}
          src={asset(`/assets/img/${id.arquivo}`)}
          alt={k === 0 ? `${titulo}: três identidades do mesmo agente e telas de CRM, jogo e aplicativo` : id.rotulo}
          fill
          className="object-contain transition-opacity duration-700"
          style={{ opacity: i === k ? 1 : 0 }}
          aria-hidden={i === k ? undefined : true}
          sizes="(max-width: 640px) 80vw, 420px"
          priority={k === 0}
        />
      ))}
      <span className="absolute bottom-2 left-2 bg-ink/85 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wide text-white">
        {IDENTIDADES[i].rotulo}
      </span>
    </>
  );
}

interface CarrosselProps {
  itens: ProjectItem[];
  onAbrir: (p: ProjectItem) => void;
  /** O Agente Adaptativo é experimentado no próprio site: o botão abre a Kirana. */
  onAbrirAtendente: () => void;
}

/**
 * Catálogo em carrossel de cartões: um cartão central em destaque, os vizinhos de lado e em perspectiva.
 * Todos têm borda; o central tem a borda com luz que percorre o contorno. Gira sozinho (pausa com o mouse
 * ou o foco), por setas, pelos marcadores, por arrasto ou pelas setas do teclado. Com "reduzir movimento" não gira sozinho.
 */
export function CarrosselProjetos({ itens, onAbrir, onAbrirAtendente }: CarrosselProps) {
  const n = itens.length;
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const inicioArrasto = useRef<number | null>(null);

  const ir = (i: number) => setAtivo((((i % n) + n) % n));
  const proximo = () => ir(ativo + 1);
  const anterior = () => ir(ativo - 1);

  useEffect(() => {
    if (pausado || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setAtivo((a) => (a + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [pausado, n]);

  const deslocamento = (i: number) => {
    let d = i - ativo;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      proximo();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      anterior();
    }
  };
  const aoSoltar = (e: PointerEvent<HTMLDivElement>) => {
    if (inicioArrasto.current === null) return;
    const dx = e.clientX - inicioArrasto.current;
    inicioArrasto.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? proximo : anterior)();
  };

  const abrirCartao = (p: ProjectItem) => (p.id === "agente-adaptativo" ? onAbrirAtendente() : onAbrir(p));

  return (
    <div
      className="mt-10"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Projetos do Opportunity Labs"
      onKeyDown={aoTeclar}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div
        className="carrossel"
        onPointerDown={(e) => {
          inicioArrasto.current = e.clientX;
        }}
        onPointerUp={aoSoltar}
        onPointerCancel={() => (inicioArrasto.current = null)}
      >
        {itens.map((item, i) => {
          const d = deslocamento(i);
          const centro = d === 0;
          const estilo = { "--d": d, "--abs": Math.abs(d) } as CSSProperties;
          const agente = item.id === "agente-adaptativo";
          return (
            <article
              key={item.id}
              className="carrossel-card"
              data-ativo={centro}
              data-oculto={Math.abs(d) > 2}
              style={estilo}
              aria-hidden={centro ? undefined : true}
              aria-label={`${i + 1} de ${n}: ${item.title}`}
              onClick={() => (centro ? abrirCartao(item) : ir(i))}
            >
              <div className="carrossel-card__corpo">
                <div className="carrossel-card__imagem" data-wipe>
                  {agente ? (
                    <ImagemIdentidades titulo={item.title} />
                  ) : hasAsset(item.img) ? (
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-contain"
                      onError={hideMissingImage}
                      sizes="(max-width: 640px) 80vw, 420px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-6 text-center font-display text-2xl text-white/80">
                      {item.title}
                    </span>
                  )}
                </div>
                <div className="carrossel-card__texto">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-accent">{item.category}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      {item.estado}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[1.65rem] font-semibold leading-tight text-white">{item.title}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-slate-300">{item.lead}</p>
                  <button
                    type="button"
                    tabIndex={centro ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (centro) abrirCartao(item);
                      else ir(i);
                    }}
                    className="btn btn-primary mt-4 self-start !py-2.5"
                  >
                    {agente ? (
                      <>
                        <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        <span>Conversar com a Kirana</span>
                      </>
                    ) : (
                      <>
                        <span>Conhecer {item.title}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        <button type="button" onClick={anterior} aria-label="Projeto anterior" className="carrossel-seta carrossel-seta--esq">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={proximo} aria-label="Próximo projeto" className="carrossel-seta carrossel-seta--dir">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <ol className="carrossel-marcadores" aria-label="Escolher projeto">
        {itens.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => ir(i)}
              aria-current={i === ativo ? "true" : undefined}
              aria-label={item.title}
              className="carrossel-marcador"
            >
              <span className="carrossel-marcador__nome">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
