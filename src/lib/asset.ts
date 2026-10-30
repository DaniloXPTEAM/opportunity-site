/**
 * Caminho base dos recursos.
 *
 * O site pode ser publicado em dois lugares:
 *
 *  - raiz do domínio (`https://usuario.github.io/`)  → basePath vazio;
 *  - subpasta        (`https://usuario.github.io/opportunity-site/`)
 *                    → basePath `/opportunity-site`.
 *
 * No GitHub Pages **de projeto**, a página fica em `/<repo>/`, mas caminhos
 * absolutos como `/assets/img/x.jpg` apontam para a raiz do domínio e dão 404.
 * Por isso todo caminho de arquivo público passa por `asset()`.
 *
 * O valor vem de `NEXT_PUBLIC_BASE_PATH` e é **embutido no bundle em tempo de
 * build** (é o mesmo valor do `basePath` do Next). Como não é segredo, pode ser
 * `NEXT_PUBLIC_*`.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Prefixa um caminho público com o basePath da publicação. */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return `${BASE_PATH}${path}`;
}
