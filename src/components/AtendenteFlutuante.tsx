"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";

/**
 * Acesso fixo ao atendente do site, no canto inferior direito, em qualquer ponto da página.
 * Some enquanto o painel do atendente está aberto (o painel ocupa o mesmo canto).
 */
export function AtendenteFlutuante({ visivel, onAbrir }: { visivel: boolean; onAbrir: () => void }) {
  if (!visivel) return null;
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label="Abrir atendente digital do site"
      className="atendente-flutuante"
    >
      <span className="atendente-flutuante__avatar">
        <Image src={asset("/assets/img/logo-mark.png")} alt="" width={40} height={40} className="h-full w-full object-contain" />
        <i aria-hidden="true" />
      </span>
      <span className="atendente-flutuante__texto">
        <strong>Falar com o atendente do site</strong>
        <small>Dúvidas? Pergunte por aqui</small>
      </span>
    </button>
  );
}
