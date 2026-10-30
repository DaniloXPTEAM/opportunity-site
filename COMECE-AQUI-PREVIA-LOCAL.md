# Comece aqui — ver o site no seu PC (Windows / PowerShell)

Este arquivo resolve exatamente o problema que você teve: **o site abria sem CSS e o console
mostrava `Unexpected token '<'`**.

Não precisa de GitHub, não precisa de hospedagem, não precisa de `npx serve`, não precisa de
`http-server`, não precisa copiar pasta nenhuma.

---

## 1. Por que o `serve` e o `http-server` falhavam (causa, não sintoma)

O site é publicado em **`https://daniloxpteam.github.io/opportunity-site/`**, então o build usa
`basePath` / `assetPrefix` = `/opportunity-site`. Isso quer dizer que o HTML pede:

```
/opportunity-site/_next/static/chunks/xxxx.css
/opportunity-site/assets/img/hero-agent-adaptive.jpg
```

Mas no disco esses arquivos ficam em `out/_next/...` e `out/assets/...` — **sem** o prefixo.
Quem serve precisa transformar `/opportunity-site/X` em `out/X`.

O `npx serve out` e o `http-server` **não fazem isso**. Eles procuram a pasta
`out/opportunity-site/`, não acham, e devolvem a página de 404 **em HTML** para os arquivos
`.css` e `.js`. O navegador tenta executar essa página de 404 como se fosse JavaScript →
`Unexpected token '<'`. Sem CSS e sem JS, o site aparece "cru" e sem design.

O `out/` sempre esteve correto. O que faltava era um servidor que respeitasse o `basePath`.
É o que o `npm run preview:pages` faz agora — ele imita o GitHub Pages de projeto.

---

## 2. O caminho mais curto (2 comandos)

Descompacte o ZIP em uma pasta simples, por exemplo `C:\opportunity-site`
(evite caminhos com acento; espaço funciona, mas o teste fica mais chato de digitar).

Abra o PowerShell **dentro dessa pasta** e rode:

```powershell
cd "C:\opportunity-site"
npm ci
npm run preview:pages
```

O que acontece:

1. `npm ci` instala as dependências (só na primeira vez).
2. `npm run preview:pages` **faz o build sozinho** (se ainda não existir) e **abre o navegador**
   em `http://127.0.0.1:4400/opportunity-site/`.

Para encerrar o servidor: **Ctrl+C** na janela do PowerShell.

> Se `npm ci` já foi feito antes nessa pasta, pode ir direto ao `npm run preview:pages`.

---

## 3. Ainda mais curto: duplo clique

Na raiz do projeto existe **`preview-pages.cmd`**. Duplo clique nele: ele confere o Node,
faz `npm ci` se faltar `node_modules`, gera o build, sobe o servidor e abre o navegador.

Do PowerShell também vale:

```powershell
.\preview-pages.cmd
```

---

## 4. Como saber que está tudo certo (prova objetiva)

Com o servidor aberto, em **outra** janela do PowerShell:

```powershell
cd "C:\opportunity-site"
node scripts/verificar-previa.mjs
```

Ele confere o que o navegador vai pedir e mostra o **código HTTP e o Content-Type** de cada
recurso. O resultado esperado termina com `=== TUDO OK ===`:

```
  ok   HTML da página responde 200 — status 200
  ok   HTML com Content-Type text/html — text/html
  ok   / redireciona para o basePath — 302 -> /opportunity-site/
  ok   HTML declara CSS/JS — 10 arquivos
  ok   0wjn_j88p0nt1.css — 200 text/css
  ok   11qk_vpw_zwkf.js — 200 text/javascript
  ok   nenhum JS/CSS recebendo HTML (evita 'Unexpected token <') — 0 ocorrência(s)
  ok   todas as imagens do HTML carregam — 6/6
  ok   todos os arquivos de public/ respondem 200 — 22/22
  ok   .nojekyll presente em out/
  ok   out/index.html presente
=== TUDO OK ===
```

Se quiser a conferência completa no navegador de verdade (design, imagens, chatbot local,
WhatsApp):

```powershell
npm run preview:pages -- --no-open   # em uma janela, sem abrir o navegador
node testes/pages-estatico.mjs       # em outra janela
```

---

## 5. Comandos disponíveis (funcionam em Windows e Linux)

| Comando | O que faz |
|---|---|
| `npm run build:pages` | Gera o site estático em `out/` com o `basePath` correto e valida o resultado |
| `npm run preview:pages` | Build (se faltar) + servidor em `http://127.0.0.1:4400/opportunity-site/` + abre o navegador |
| `npm run serve:pages` | Igual, mas **sem** abrir o navegador |
| `node scripts/verificar-previa.mjs` | Checagem HTTP de status e Content-Type de HTML, CSS, JS, imagens e `public/` |
| `npm run auditar` | Varredura do ambiente: imports, assets, nomes inválidos no Windows, scripts inexistentes, comandos errados na documentação, `.gitignore` escondendo código, CRLF dos `.cmd` |
| `node testes/pages-estatico.mjs` | Teste de navegador: design, imagens, Kirana local, WhatsApp |
| `npm run dev` | Versão **dinâmica** (desenvolvimento) — mantida intacta |

Opções úteis do `preview:pages`:

```powershell
npm run preview:pages -- --rebuild     # força refazer o build antes de servir
$env:PORT=4500; npm run preview:pages  # outra porta (a 4400 pode estar ocupada)
```

---

## 6. O que mudou neste ZIP (só a execução local — nada de conteúdo/design)

| Arquivo | Papel |
|---|---|
| `scripts/build-pages.mjs` | **Novo.** Build estático multiplataforma: define as variáveis dentro do Node (não depende de sintaxe POSIX), chama o Next, confere `.nojekyll`, prefixo e existência de CSS/JS |
| `scripts/preview-pages.mjs` | **Novo.** Servidor que imita o GitHub Pages de projeto: mapeia `/opportunity-site/*` para `out/*`, com `Content-Type` correto |
| `scripts/verificar-previa.mjs` | **Novo.** Verificação HTTP de status + Content-Type |
| `preview-pages.cmd` | **Novo.** Duplo clique no Windows (ASCII + CRLF, confere a versão do Node, seguro no PowerShell e no cmd) |
| `scripts/auditar-ambiente.mjs` | **Novo.** Auditoria do ambiente local (ver tabela acima) |
| `.gitattributes` | **Novo.** Força CRLF nos `.cmd`/`.bat` em qualquer clone/export |
| `package.json` | `build:pages` agora é `node scripts/build-pages.mjs`; novos `preview:pages` e `serve:pages` |
| `scripts/serve-pages.mjs` | **Removido** (substituído pelo `preview-pages.mjs`, que resolve o `basePath`) |
| `testes/pages-estatico.mjs` | Passou a verificar também o **CSS aplicado** (folhas, tipografia, peso do título, cores do design) e usa a porta padrão 4400 |
| `.gitignore` | `data/` virou `/data/`: antes a regra também escondia `src/data/` (`portfolio.ts`, `scenarios.ts`), o que **quebrava o build** de quem clonasse o repositório |

Nada de conteúdo, texto, imagem ou integração foi alterado: a versão **dinâmica**
(`npm run dev`) e a integração com a **Kirana** continuam como estavam, e o site publicado
em `opportunity.ia.br` não foi tocado.

---

## 7. Se algo der errado

| Sintoma | Causa | Solução |
|---|---|---|
| `npm run build:pages` não é reconhecido | `package.json` antigo (ZIP anterior) | Use este ZIP; confirme com `npm run` e veja se aparece `build:pages` |
| `'PAGES_STATIC' não é reconhecido...` | Tentou o comando POSIX antigo | Use `npm run build:pages` (não existe mais comando longo para digitar) |
| Site sem CSS, console com `Unexpected token '<'` | Está servindo `out/` com `serve`/`http-server` | Use `npm run preview:pages`, que mapeia o `basePath` |
| 404 em `/opportunity-site/` | Caminho errado: `out/opportunity-site` não existe | O `preview:pages` já resolve; não copie `out` para dentro de outra pasta |
| Porta 4400 em uso | Outra prévia aberta | O script avisa e usa a próxima livre (4401, 4402…); para fixar: `$env:PORT=4500; npm run preview:pages` |
| Mudou o código e a prévia mostra a versão antiga | `out/` de um build anterior | O script detecta e refaz o build sozinho; para forçar: `npm run preview:pages -- --rebuild` |
| `[verificar] não há servidor em …` | Rodou a checagem sem a prévia aberta | Abra `npm run preview:pages -- --no-open` em outra janela |
| `npm ci` falha | Node antigo ou cache corrompido | `node -v` (precisa 20+), depois `npm cache clean --force` e `npm ci` de novo |
| `Cannot find module 'next/dist/bin/next'` | `node_modules` incompleto | `npm ci` novamente na raiz do projeto |
| Página abre em branco no navegador | Abriu `out/index.html` com duplo clique (`file://`) | Use a URL do servidor: `http://127.0.0.1:4400/opportunity-site/` |

---

## 8. O que **não** fazer

- Não abra `out/index.html` com duplo clique (`file://`): com `basePath`, o navegador procura os
  recursos em caminhos que não existem no disco.
- Não use `npx serve out` nem `http-server out` — nenhum dos dois cria o prefixo
  `/opportunity-site`.
- Não copie `out/` para dentro de `preview/opportunity-site/` e sirva a pasta de cima: isso
  cria `preview/opportunity-site/opportunity-site/` e volta a dar 404.
- Nada aqui publica nada. Publicar é um passo separado e depende da sua autorização.
