# Publicação estática no GitHub Pages

Ambiente de **avaliação** da nova versão do site, publicado em separado:

```
https://daniloxpteam.github.io/opportunity-site/
```

Não é o site oficial. `opportunity.ia.br` (Cloudflare) continua exatamente como está — outro
projeto, outro deploy, nenhum arquivo tocado.

---

## 1. O que esta publicação é (e o que não é)

| Recurso | Nesta versão estática | Por quê |
|---|---|---|
| Página, layout, imagens, textos | ✅ completos | export estático |
| Showcases ("Kirana em Ação") | ✅ funcionando | respostas prontas de `src/data/scenarios.ts`, agora consultadas no navegador |
| Atendente Kirana | ⚠️ aparece como **"Atendimento indisponível"** | não existe servidor para `/api/kirana/*`; a implementação (streaming, ferramentas, confirmação) segue inteira no código |
| Formulário de contato | ⚠️ abre o **WhatsApp oficial** com a mensagem preenchida | sem servidor não há gravação de lead; nenhum dado é perdido nem prometemos registro |
| Links de contato | ✅ (85) 99946-2763 · rafael@opportunity.ia.br | dados conferidos no site oficial |

Para a versão completa (atendente real), continua valendo `docs/HOSPEDAGEM.md`: host Node para o
site, host com disco para a Kirana e o Gateway acessível — o mesmo código, build sem `PAGES_STATIC`.

---

## 2. Como o build estático funciona

O projeto continua sendo **um só**. Quem decide o modo é o ambiente:

```bash
npm run build          # dinâmico (servidor + /api/*)  → npm start
npm run build:pages    # estático (GitHub Pages)       → out/
```

`npm run build:pages` liga três coisas:

| Variável | Valor | Efeito |
|---|---|---|
| `PAGES_STATIC` | `1` | `next.config.ts` usa `output: "export"`, `images.unoptimized`, `pageExtensions` sem `ts` (as rotas `route.ts` saem do build) |
| `PAGES_BASE_PATH` / `NEXT_PUBLIC_BASE_PATH` | `/opportunity-site` | todo caminho público passa por `asset()` (src/lib/asset.ts): `/assets/...` vira `/opportunity-site/assets/...` |
| `NEXT_PUBLIC_STATIC_EXPORT` | `1` | showcases respondem no navegador; formulário usa WhatsApp; atendente já sabe que está offline |

Artefato: `out/` (≈4,8 MB, 51 arquivos) com `.nojekyll` copiado de `public/`.

### Rotas de API no build estático

`pageExtensions: ["tsx", "jsx", "mdx"]` faz o Next ignorar `route.ts` (todas as rotas usam `.ts`;
páginas e layouts usam `.tsx`). Nada é apagado: no build dinâmico as seis rotas continuam
aparecendo e funcionando.

---

## 3. Imagens: 19 publicadas, 3 ausentes (declaradas)

| Arquivo | Situação |
|---|---|
| `assets/img/*.jpg` (16), `logo-mark.png`, `favicon.png`, `og-image.png` | **presentes** e verificados (22/22 arquivos de `public/` respondem 200) |
| `assets/img/rpg-comic-chronicles.jpg` | **não existe** em nenhuma cópia |
| `assets/img/processo-inteligente-empresas.jpg` | **não existe** em nenhuma cópia |
| `images/lab-cine.jpg` | **não existe** em nenhuma cópia |

Onde procurei: o ZIP do Drive (só `src/`), o `public/` recuperado do site publicado, as 23 URLs do
sitemap oficial (`/assets/img/*` referenciadas pelo site oficial: 25 arquivos, nenhum é um dos três)
e todos os ZIPs/bundle do workspace. **Nenhuma imagem foi gerada ou substituída por foto de outro
projeto.**

Como isso é tratado: `scripts/gen-assets-manifest.mjs` roda antes de cada build e lista o que existe
em `public/` → `src/lib/assets.generated.json`. Os componentes só renderizam (e só pedem) arquivos
presentes. Resultado: **sem 404, sem ícone de imagem quebrada**; o card do RPG mostra o gradiente do
próprio projeto, o bloco de Soluções mantém o painel escuro com o texto, e a galeria do CineForma
mostra só a captura que existe. Quando os arquivos chegarem, basta colocá-los em `public/` e
republicar — eles aparecem sem mexer em código.

---

## 4. Publicar (você executa — eu não tenho credencial GitHub)

### 4.1 Primeira vez

```bash
# no seu PC, dentro da pasta do projeto (a que contém package.json)
git init -b main
git add .
git commit -m "site Opportunity AI — versão estática para avaliação (GitHub Pages)"
git remote add origin https://github.com/DaniloXPTEAM/opportunity-site.git
git push -u origin main
```

O repositório precisa existir vazio no GitHub (`DaniloXPTEAM/opportunity-site`), **sem** README
inicial.

### 4.2 Ligar o Pages

1. GitHub → repositório → **Settings → Pages**;
2. em *Build and deployment* → **Source: GitHub Actions**;
3. o workflow `.github/workflows/pages.yml` já está no repositório: a cada push em `main` ele roda
   `npm ci` → `npm run build:pages` → publica `out/`;
4. acompanhe em **Actions → Publicar no GitHub Pages**; a URL aparece em Settings → Pages.

Também dá para disparar na mão: Actions → *Publicar no GitHub Pages* → **Run workflow**.

### 4.3 Conferir depois de publicado

```bash
curl -I https://daniloxpteam.github.io/opportunity-site/            # 200
curl -I https://daniloxpteam.github.io/opportunity-site/assets/img/logo-mark.png   # 200
```

No navegador: imagens carregando, showcase respondendo, botão da Kirana abrindo com "Atendimento
indisponível", formulário abrindo o WhatsApp, console sem erro.

---

## 5. Testar localmente antes de subir

```bash
npm ci
npm run build:pages                      # gera out/ com o basePath correto
npm run preview:pages                    # imita o Pages de projeto (porta 4400)
# em outro terminal:
node scripts/verificar-previa.mjs        # status + Content-Type de cada recurso
node testes/pages-estatico.mjs           # 18 verificações
```

Resultado medido nesta entrega: **18/18** (página 200, 22/22 arquivos de `public/` em 200, showcase
respondendo, atendente indisponível, WhatsApp oficial, zero 404, zero erro de console).

Regressão da versão dinâmica (mesma base de código): `next build` OK, `testes/integracao.mjs`
**15/15**, `testes/navegacao.mjs` **4/4** — com a Kirana v0.5.3 e o gateway **mock**.
Isso **não** é homologação do Gateway real.

---

## 6. O que NÃO foi tocado

- `opportunity.ia.br` e a configuração da Cloudflare Pages;
- repositório `DaniloXPTEAM/Kirana` e o Gateway ChatGPT;
- código da Kirana (o site apenas conversa com ela na versão dinâmica);
- dados persistidos, `.env` e credenciais.

## 7. Limites conhecidos desta publicação

1. Sem servidor: atendente e formulário degradam como descrito na seção 1.
2. Sem banco: nada de leads gravados nesta versão.
3. `SITE_URL` do build estático aponta para a URL do Pages (metadados/OpenGraph).
4. As 3 imagens ausentes continuam ausentes até você enviá-las.
