import { SOLUCOES_NEGOCIO } from "@/data/solucoes";

/**
 * Faixa contínua com as frentes de trabalho: mostra de relance o alcance da oferta.
 * Com "reduzir movimento" no sistema, a faixa fica parada e quebra em linhas (ver globals.css).
 */
export function Faixa({ className = "" }: { className?: string }) {
  const itens = SOLUCOES_NEGOCIO.map((s) => s.titulo);
  const trilho = (oculto: boolean) => (
    <ul className="faixa-trilho" aria-hidden={oculto || undefined}>
      {itens.map((t) => (
        <li key={t}>
          <span>{t}</span>
          <i aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`faixa ${className}`} role="group" aria-label="Frentes de trabalho da Opportunity AI">
      <div className="faixa-corre">
        {trilho(false)}
        {trilho(true)}
      </div>
    </div>
  );
}
