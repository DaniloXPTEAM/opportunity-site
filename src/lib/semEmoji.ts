/**
 * Remove emoji de textos vindos dos dados de demonstração.
 * O site usa ícones de linha no lugar de emoji; aplicado a toda string (inclusive aninhada).
 */
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

export function semEmoji<T>(valor: T): T {
  if (typeof valor === "string") return valor.replace(EMOJI, "").replace(/^\s+/, "") as unknown as T;
  if (Array.isArray(valor)) return valor.map((v) => semEmoji(v)) as unknown as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor as Record<string, unknown>).map(([k, v]) => [k, semEmoji(v)])) as T;
  }
  return valor;
}
