# Opportunity AI — nova versão do site (ambiente de avaliação)

Duas publicações, **um código**:

| Modo | Comando | Onde | O que funciona |
|---|---|---|---|
| Estático | `npm run build:pages` | GitHub Pages: `https://daniloxpteam.github.io/opportunity-site/` | página completa, showcases, formulário → WhatsApp; atendente Kirana aparece indisponível |
| Dinâmico | `npm run build && npm start` | host com Node + Kirana v0.5.3 | tudo acima **mais** atendente real com streaming, ferramentas e confirmação |

O site oficial `opportunity.ia.br` e a Cloudflare **não** fazem parte deste repositório e não são
tocados por ele.

---

## Publicar no GitHub Pages (passo a passo)

### 1. Criar o repositório

No GitHub: **New repository** → nome `opportunity-site` → **sem** README, sem .gitignore, sem licença
(o projeto já traz os seus).

### 2. Enviar o código

```bash
cd caminho/da/pasta-do-projeto
git init -b main
git add .
git commit -m "site Opportunity AI — versão estática para avaliação (GitHub Pages)"
git remote add origin https://github.com/DaniloXPTEAM/opportunity-site.git
git push -u origin main
```

### 3. Ligar o Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

O workflow já está em `.github/workflows/pages.yml`. Cada push em `main` executa
`npm ci` → `npm run build:pages` → publica `out/`.

### 4. Conferir

- **Actions** → "Publicar no GitHub Pages" verde;
- **Settings → Pages** → URL publicada;
- abrir `https://daniloxpteam.github.io/opportunity-site/` e checar: imagens, showcases, botão da
  Kirana com "Atendimento indisponível", formulário abrindo o WhatsApp, console limpo.

### 5. Atualizar depois

```bash
git add .
git commit -m "ajuste no site"
git push
```

O deploy é automático.

---

## Testar antes de publicar

```bash
npm ci
npm run build:pages                       # gera out/ com o basePath correto
npm run preview:pages                     # imita o Pages de projeto e abre o navegador
# em outro terminal:
node scripts/verificar-previa.mjs         # status + Content-Type de cada recurso
node testes/pages-estatico.mjs            # 18 verificações no navegador
```

Guia completo para Windows/PowerShell: `COMECE-AQUI-PREVIA-LOCAL.md`.

Regressão da versão dinâmica (precisa da Kirana e do `mock-gateway.js` **do repositório Kirana**,
não deste projeto — aqui não existe `scripts/mock-gateway.js`):

```bash
npm run build && npx next start -p 3200
node testes/integracao.mjs http://127.0.0.1:3200     # 15 verificações
MOCK_FORCE_TOOL=navigate_to_page node testes/navegacao.mjs http://127.0.0.1:3200   # 4 verificações
```

---

## Estrutura

```
src/app/                 página única + rotas de API (dinâmico)
src/components/          seções do site (Hero, Solutions, Portfolio, ResidentKirana, …)
src/lib/asset.ts         prefixo de basePath em todo caminho público
src/lib/showcase.ts      respostas dos showcases (usada pela rota e pelo navegador)
src/lib/media.ts         controle de imagens ausentes (sem 404)
src/lib/assets.generated.json   lista real de public/ (gerada no build)
src/data/                projetos e cenários dos showcases
public/                  19 imagens + favicon + OG + .nojekyll
docs/                    HOSPEDAGEM, PENDENCIAS, INTEGRACAO-KIRANA, PUBLICACAO-GITHUB-PAGES
testes/                  integracao.mjs, navegacao.mjs, pages-estatico.mjs
scripts/                 gen-assets-manifest.mjs, build-pages.mjs, preview-pages.mjs, verificar-previa.mjs
.github/workflows/       pages.yml
```

## Documentação

- `docs/PUBLICACAO-GITHUB-PAGES.md` — como a publicação estática funciona e seus limites;
- `docs/HOSPEDAGEM.md` — a versão completa (site + Kirana + Gateway);
- `docs/PENDENCIAS.md` — o que falta e de quem depende;
- `docs/INTEGRACAO-KIRANA.md` — o que foi integrado no atendente.
