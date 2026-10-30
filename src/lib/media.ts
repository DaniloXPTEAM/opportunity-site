/**
 * Imagens ausentes do pacote.
 *
 * Três arquivos citados pelo projeto **não existem** em nenhuma cópia
 * disponível (ZIP original do Drive — que só tem `src/` —, no `public/`
 * recuperado do site publicado, nem no site oficial):
 *
 *   - /assets/img/rpg-comic-chronicles.jpg          (card do RPG Comic Chronicles)
 *   - /assets/img/processo-inteligente-empresas.jpg (bloco de Soluções)
 *   - /images/lab-cine.jpg                          (galeria do CineForma)
 *
 * Decisão: **não** inventar imagem e **não** trocar por foto de outro projeto.
 * O caminho continua no código (para quando o arquivo chegar); a diferença é que
 * agora ele é checado contra a lista real de `public/`
 * (`assets.generated.json`, gerada antes de cada build):
 *
 *  - se existe → renderiza normalmente;
 *  - se não existe → o componente nem tenta carregar (sem 404, sem ícone de
 *    imagem quebrada, sem texto alternativo solto) e o contêiner mostra o fundo
 *    planejado (gradiente do projeto ou painel escuro).
 *
 * Quando o arquivo for adicionado em `public/`, o próximo build o inclui e ele
 * reaparece sem nenhuma alteração de código.
 */
import manifest from "@/lib/assets.generated.json";
import { BASE_PATH } from "@/lib/asset";

const AVAILABLE = new Set<string>(manifest.files as string[]);

/**
 * O manifesto lista os arquivos **sem** o prefixo de publicação
 * (`/assets/img/x.jpg`), mas as chamadas chegam com o prefixo
 * (`/opportunity-site/assets/img/x.jpg`, vindo de `asset()`).
 *
 * Sem normalizar, `hasAsset()` respondia `false` para todo caminho prefixado e
 * as capas dos projetos sumiam do catálogo. Aqui os dois formatos são aceitos.
 */
function chavePublica(caminho: string): string {
  if (!BASE_PATH) return caminho;
  if (caminho === BASE_PATH) return "/";
  return caminho.startsWith(`${BASE_PATH}/`) ? caminho.slice(BASE_PATH.length) : caminho;
}

/** `true` quando o arquivo existe em `public/` neste build. */
export function hasAsset(path: string): boolean {
  return AVAILABLE.has(chavePublica(path));
}

/** Devolve o caminho só se o arquivo existir; caso contrário, `null`. */
export function existingAsset(path: string): string | null {
  return AVAILABLE.has(chavePublica(path)) ? path : null;
}

/** Lista de arquivos publicados neste build (para diagnóstico). */
export function publishedAssets(): string[] {
  return [...AVAILABLE].sort();
}

/**
 * Rede de segurança para imagens que existam no pacote mas falhem na rede:
 * esconde o `img` e deixa o fundo do contêiner aparecer.
 */
export function hideMissingImage(event: { currentTarget: HTMLImageElement }): void {
  const img = event.currentTarget;
  img.style.opacity = "0";
  img.setAttribute("data-missing", "true");
}
