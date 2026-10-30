import type { NextConfig } from "next";

/**
 * Duas publicações, um código.
 *
 * 1. Dinâmica (padrão) — `npm run build && npm start`
 *    Next.js com servidor: páginas + as rotas `/api/*` (ponte segura com a
 *    Kirana, formulário, showcases). Nada muda em relação ao que já existia.
 *
 * 2. Estática (GitHub Pages) — `npm run build:pages`
 *    Ativada por `PAGES_STATIC=1`. Exporta HTML/CSS/JS/imagens para `out/`,
 *    com `basePath` quando o site fica em subpasta (`/opportunity-site`).
 *    Nesse modo não existe servidor, então:
 *      - as rotas de API saem do build (ver `pageExtensions` abaixo);
 *      - os showcases respondem no navegador (src/lib/showcase.ts);
 *      - o formulário abre o WhatsApp;
 *      - o atendente aparece como indisponível.
 */
const PAGES_STATIC = process.env.PAGES_STATIC === "1";
const BASE_PATH = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = PAGES_STATIC
  ? {
      output: "export",
      basePath: BASE_PATH || undefined,
      // GitHub Pages serve arquivos fixos: sem otimizador de imagem no servidor.
      images: { unoptimized: true },
      // `route.ts` não entra no build estático. Os handlers usam `.ts`; páginas e
      // layouts usam `.tsx`, então continuam sendo reconhecidos.
      pageExtensions: ["tsx", "jsx", "mdx"],
      trailingSlash: true,
    }
  : {};

export default nextConfig;
