import type { ReactNode } from "react";

/**
 * Cabeçalho de seção: o MESMO em todo o site (etiqueta, título e texto de apoio),
 * para que nenhuma seção tenha tamanho, peso ou espaço próprio.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  className = "",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={`max-w-3xl ${className}`}>
      <p className="eyebrow" data-reveal>{eyebrow}</p>
      <h2 className="t-h2 mt-4" data-split>{title}</h2>
      {lead && (
        <p className="t-lead mt-5" data-reveal>
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}
