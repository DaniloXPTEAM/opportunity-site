# Verificação de erros do mesmo tipo (prévia local)

Data: 2026-10-27 · Projeto: `opportunity-site` (commit final deste relatório: ver `git log`)
Escopo: **só execução/prévia local**. Nada publicado, `opportunity.ia.br`, Kirana e Gateway intocados.

---

## Como a verificação foi feita

Tudo foi executado **a partir do ZIP entregue**, extraído em pasta vazia, com `npm ci` do zero —
exatamente o caminho do seu Windows. Depois disso, rodei a varredura do ambiente, o build, a prévia,
a checagem HTTP e o teste de navegador real.

A pergunta era: *existe outro problema da mesma família do `Unexpected token '<'`?* — ou seja,
alguma armadilha que quebre o build ou faça a prévia mostrar o site errado/sem design.

---

## Resultado final (ZIP extraído do zero)

| Etapa | Comando | Resultado |
|---|---|---|
| Dependências | `npm ci` | OK — 407 pacotes, 9 s |
| Auditoria do ambiente | `npm run auditar` (novo) | **AMBIENTE OK** |
| Build estático | `npm run build:pages` | OK — `out/` 51 arquivos, 4,7 MB, prefixo correto, `.nojekyll` |
| Prévia | `npm run preview:pages` | OK — `http://127.0.0.1:4400/opportunity-site/` |
| Status e Content-Type | `node scripts/verificar-previa.mjs` | **TUDO OK** (CSS `text/css`, JS `text/javascript`, 0 JS recebendo HTML) |
| Todos os arquivos servidos | varredura de `out/` + `public/` | **73/73 em 200**, nenhum recurso com `text/html` indevido |
| Design no navegador | `node testes/pages-estatico.mjs` | **18/18 OK** (CSS aplicado, 9/9 imagens, Kirana local, WhatsApp, console limpo) |
| Versão dinâmica | `npm run build` + `npm run dev` | `/` → 200, `/api/health` → 200, 6 rotas de API preservadas |

---

## Erros encontrados nesta varredura (todos corrigidos)

### 1. ZIP saído do git vinha **sem `src/data/`** — o build quebrava
- **Sintoma:** `Module not found: Can't resolve '@/data/portfolio'` e o build morre.
- **Causa:** o `.gitignore` tinha `data/`, que casa com **qualquer** pasta `data` do projeto,
  inclusive `src/data/` (`portfolio.ts`, `scenarios.ts`). Os arquivos existiam no disco, mas nunca
  foram versionados — então qualquer ZIP/clone saía sem eles.
- **Correção:** regra passou a ser `/data/` (só a pasta da raiz) e os dois arquivos foram versionados.

### 2. Porta 4400 ocupada derrubava a prévia com stack trace
- **Sintoma:** `Error: listen EADDRINUSE: address already in use 127.0.0.1:4400` + stack trace.
- **Causa:** `server.listen()` sem tratamento do evento `error`.
- **Correção:** o script avisa e sobe na próxima porta livre (4401, 4402…). Mensagem clara só se
  não houver porta livre. *(Na primeira versão da correção apareciam duas URLs; corrigido e testado.)*

### 3. Prévia servindo build antigo sem avisar
- **Sintoma:** você muda o código e a prévia continua mostrando a versão anterior.
- **Correção:** o script compara a data de `out/index.html` com `src/`, `public/`, `next.config.ts`,
  `package.json` e, se estiver velho, **refaz o build** com aviso no terminal.

### 4. Documentação mandava rodar scripts que não existem mais
- `README-PUBLICACAO.md` e `docs/PUBLICACAO-GITHUB-PAGES.md`: `node scripts/serve-pages.mjs 4300`
  (arquivo removido) → agora `npm run preview:pages` + `verificar-previa`.
- `README-PUBLICACAO.md` e `docs/PENDENCIAS.md`: `scripts/mock-gateway.js` e `scripts/site-sync.mjs`
  são **do repositório da Kirana**; agora o texto diz isso explicitamente.
- Guia de páginas e README atualizados de "14/14" para "18/18" verificações.

### 5. Teste de navegador apontava para porta que não existe
- `testes/pages-estatico.mjs` usava `http://127.0.0.1:4300` por padrão e citava `serve-pages.mjs`
  no cabeçalho → `ERR_CONNECTION_REFUSED`. Agora usa a porta padrão 4400 da prévia.

### 6. Rodar a checagem com o servidor desligado gerava exceção
- **Sintoma:** stack trace de `fetch failed` / `ERR_CONNECTION_REFUSED` no Playwright.
- **Correção:** `verificar-previa.mjs` e `testes/pages-estatico.mjs` explicam "não há servidor em …,
  abra `npm run preview:pages -- --no-open`" e saem com código 1.

### 7. Windows: `.cmd` sem garantia de CRLF e sem checagem de Node
- **Correção:** `.gitattributes` força `eol=crlf` em `*.cmd`/`*.bat`; o `preview-pages.cmd` agora
  confere a versão do Node (Next 16 exige 20+) antes de tentar instalar/buildar, e `package.json`
  declara `engines.node >= 20.9.0`.

---

## O que foi verificado e **não** apresentou problema

| Verificação | Resultado |
|---|---|
| 37 imports `@/…` (inclusive caixa das letras, que quebra no Linux/Pages) | todos resolvem |
| 22 assets do manifesto × `public/` | sincronizados |
| `url()` dentro do CSS (fundo, fontes) | nenhuma — nada a faltar |
| Recursos declarados no HTML (`src`, `href`, `srcset`) | 14/14 existem |
| `404.html` do export | existe e já usa o prefixo `/opportunity-site/` |
| Nomes de arquivo inválidos/reservados/colisão de maiúsculas no Windows | zero |
| Caminho com espaços e acentos (`C:\CRiando coisa nova\Kirana\…`) | build + prévia + 18/18 OK |
| `localhost`/`127.0.0.1` fixo no código da aplicação | nenhum |
| `basePath` coerente em `next.config.ts`, `build-pages.mjs` e `preview-pages.mjs` | sim |
| `.env.local` presente (com `KIRANA_*`) atrapalha o build estático? | não — variáveis do script têm precedência |
| Workflow do Pages (`npm ci` → `build:pages` → publica `out/`) | coerente, sem sintaxe POSIX |
| Imagens ausentes conhecidas (3) | não geram 404 por decisão de projeto (`media.ts`) |

**Observação (não é erro):** a fonte *Plus Jakarta Sans* vem do Google Fonts por `<link>`. Sem
internet a página usa a fonte de sistema (a fonte é declarada com fallback), sem quebrar layout.

---

## Como repetir a verificação a qualquer momento

```powershell
cd "C:\CRiando coisa nova\Kirana\opportunity-site-pronto"
npm ci
npm run auditar                  # varredura do ambiente, sem precisar de servidor
npm run preview:pages            # build + servidor + navegador
# em outra janela:
node scripts/verificar-previa.mjs
node testes/pages-estatico.mjs
```

O `npm run auditar` é a rede de segurança contra esta família de erros: ele falha (código 1) se
algo for reintroduzido — import que não resolve, asset ausente, script citado e inexistente,
`.gitignore` escondendo código, arquivo essencial fora do git, `.cmd` sem CRLF, `basePath` divergente.
Testado com defeitos plantados de propósito: ele acusa os quatro tipos.
