/**
 * Id único por mensagem, gerado fora do render.
 *
 * `Date.now()` chamado dentro de componente é marcado como função impura pela
 * regra `react-hooks/purity`. Um contador de módulo resolve: o id é único
 * durante a sessão do navegador e o componente continua puro.
 */
let seq = 0;

export function novoId(prefixo: string): string {
  seq += 1;
  return `${prefixo}-${seq}`;
}
