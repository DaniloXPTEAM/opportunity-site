"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registrarGsap, ScrollTrigger, SplitText } from "@/lib/motion";

/**
 * Movimento do site (GSAP), ligado por atributos nos elementos, sem texto novo:
 *
 *  - data-split           título que sobe linha a linha, dentro de uma máscara
 *  - data-reveal[=left|right]  bloco que entra ao aparecer na tela
 *  - data-stagger         os filhos diretos entram em sequência
 *  - data-wipe            imagem que se revela em varredura
 *  - data-count="N"       número que sobe até N
 *  - data-parallax="0.1"  deslocamento leve com a rolagem (só translação; a imagem nunca é cortada)
 *
 * Melhoria progressiva: sem JavaScript, ou com "reduzir movimento" no sistema, nada disso roda e o conteúdo
 * aparece pronto. O script do layout só liga data-motion="on" quando o movimento é permitido; este componente
 * troca para "live" depois de montar os estados iniciais (e uma animação de segurança no CSS mostra tudo
 * se, por algum motivo, o GSAP não assumir).
 */
export function Motion() {
  const barra = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    registrarGsap();
    const raiz = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lista = <T extends Element = HTMLElement>(seletor: string) => gsap.utils.toArray<T>(seletor);

      // Títulos em linhas com máscara.
      const titulos = lista("[data-split]");
      gsap.set(titulos, { visibility: "hidden" });
      titulos.forEach((el) => {
        const noTopo = el.hasAttribute("data-split-now");
        try {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            linesClass: "linha-titulo",
            onSplit(self) {
              gsap.set(el, { visibility: "visible" });
              return gsap.from(self.lines, {
                yPercent: 108,
                duration: 1.05,
                ease: "power4.out",
                stagger: 0.09,
                delay: noTopo ? 0.15 : 0,
                scrollTrigger: noTopo ? undefined : { trigger: el, start: "top 88%", once: true },
              });
            },
          });
        } catch {
          gsap.set(el, { visibility: "visible" });
        }
      });

      // Blocos que entram ao aparecer.
      lista("[data-reveal]").forEach((el) => {
        const lado = el.getAttribute("data-reveal");
        const de = { opacity: 0, x: lado === "left" ? -56 : lado === "right" ? 56 : 0, y: lado ? 0 : 28 };
        gsap.set(el, de);
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.95, ease: "power3.out", clearProps: "opacity,transform" }),
        });
      });

      // Grupos: os filhos entram em sequência.
      lista("[data-stagger]").forEach((el) => {
        const filhos = Array.from(el.children);
        gsap.set(filhos, { opacity: 0, y: 24 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(filhos, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.08, clearProps: "opacity,transform" }),
        });
      });

      // Imagens que se revelam em varredura (a imagem inteira aparece; nada é cortado quando termina).
      lista("[data-wipe]").forEach((el) => {
        gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () =>
            gsap.to(el, { clipPath: "inset(0 0% 0 0)", duration: 1.15, ease: "power3.inOut", delay: 0.1, clearProps: "clipPath" }),
        });
      });

      // Números que sobem.
      lista("[data-count]").forEach((el) => {
        const alvo = Number(el.getAttribute("data-count"));
        if (!Number.isFinite(alvo)) return;
        const estado = { v: 0 };
        el.textContent = "0";
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () =>
            gsap.to(estado, {
              v: alvo,
              duration: 1.4,
              ease: "power2.out",
              delay: 0.25,
              onUpdate: () => {
                el.textContent = String(Math.round(estado.v));
              },
              onComplete: () => {
                el.textContent = String(alvo);
              },
            }),
        });
      });

      // Paralaxe leve (só translação).
      lista("[data-parallax]").forEach((el) => {
        const velocidade = Number(el.getAttribute("data-parallax")) || 0.1;
        gsap.to(el, {
          y: () => -velocidade * 160,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
      });

      // Barra de progresso da leitura.
      if (barra.current) {
        gsap.set(barra.current, { scaleX: 0, transformOrigin: "0 50%" });
        gsap.to(barra.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 },
        });
      }

      // O layout muda (acordeões, filtros, imagens): recalcula os pontos de disparo.
      let aguarda = 0;
      const recalcula = () => {
        window.clearTimeout(aguarda);
        aguarda = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      const observador = new ResizeObserver(recalcula);
      observador.observe(document.body);
      window.addEventListener("load", recalcula);

      raiz.dataset.motion = "live";

      return () => {
        observador.disconnect();
        window.removeEventListener("load", recalcula);
        window.clearTimeout(aguarda);
      };
    });

    return () => mm.revert();
  }, []);

  return <div ref={barra} aria-hidden="true" className="progresso-leitura" />;
}
