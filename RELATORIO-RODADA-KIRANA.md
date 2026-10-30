# Relatório da rodada — correções do MD consolidado + integração da Kirana

Data: **28/10/2026** · Base: commit `1b561d4` (reorganização aprovada, preservada)
**Publicação: não autorizada e não executada.** `opportunity.ia.br`, hospedagem,
repositório da Kirana, Gateway e credenciais de produção **não foram tocados**.

---

## 1. O que foi corrigido nesta rodada

| # | Item do MD | Antes | Agora |
|---|---|---|---|
| 1 | RPG Comic Chronicles — "captura em produção" na interface | o cartão sem captura exibia o texto `captura em produção` | texto removido. O cartão usa **composição de identidade do próprio projeto**: monograma `RP`, fio e a área do projeto (`QUADRINHOS & NARRATIVA COM IA`) sobre o gradiente da paleta do projeto. Nenhuma imagem gerada, nenhuma captura inventada, título/descrição/estado preservados |
| 2 | Nota de transparência do catálogo | repetia "captura em produção" | passou a explicar que, sem captura, o cartão mostra só a identidade do projeto |
| 3 | Sobre — cargo do fundador | "Fundador · Opportunity AI" | **"Fundador e CEO"**, exatamente como no site oficial |
| 4 | Sobre — imagem/avatar do fundador | quadrado com o logo ao lado do nome + parágrafo "Foto oficial ainda não disponível…" | **nenhuma imagem, nenhum avatar, nenhum espaço reservado** e **nenhuma menção à foto ausente**. Restou identificação textual (nome, nome social, cargo) e uma frase sobre a empresa, sem biografia e sem dados pessoais |
| 5 | Kirana no cabeçalho | ponte já implementada, nunca exercitada de ponta a ponta no navegador | **executada**: navegador → site → Kirana v0.5.3 → gateway, com evidências (§3) |

O que **não** mudou: `DiagonalShowcase`, ordem e conteúdo das 8 seções, catálogo
(9 projetos / 5 grupos / estados reais), Soluções, Agente Adaptativo,
identidade visual, cabeçalho fixo, responsividade, ausência de botão flutuante,
WhatsApp `(85) 99946-2763`.

## 2. Evidências por categoria

Arquivos de saída em `evidencias/` (texto) e `entregas/capturas-reorganizacao/`
(20 PNGs). Reproduza com os comandos da §6.

### 2.1 Interface (navegador real, 3 tamanhos)

`evidencias/02-interface-estatico.txt` e `evidencias/02-interface-dinamico.txt`
— **60 verificações aprovadas em cada** (20 por viewport: 1440×900, 768×1024,
390×844), incluindo as novas:

- `ok nenhum cartão exibe 'captura em produção'`
- `ok cartão do RPG Comic Chronicles presente`
- `ok cartão sem captura não promete imagem que não existe`
- `ok cartão sem captura usa composição de identidade do projeto`
- `ok Sobre com 'Danilo de Vasconcelos Silva — Fundador e CEO'`
- `ok Sobre não menciona foto/avatar ausente`
- `ok Sobre sem imagem do fundador (só conteúdo textual na identificação)`
- `ok contato expõe o WhatsApp oficial (85) 99946-2763`
- `ok sem botão flutuante sobre o conteúdo` · `ok sem rolagem horizontal` ·
  `ok console limpo` · `ok nenhum recurso 404`

### 2.2 Estático (GitHub Pages)

`evidencias/01-estatico.txt` → `npm run auditar` (**AMBIENTE OK**), 51 arquivos,
`basePath` coerente, manifesto de assets 22×22; `verificar-previa` (**TUDO OK**);
`testes/pages-estatico.mjs` (**TUDO OK**: 16/16 imagens carregadas, 22/22
arquivos de `public/` com 200, atendente mostrando **"Atendimento indisponível"**
com campo desabilitado, WhatsApp oficial funcionando, console limpo).

### 2.3 Dinâmico (Node)

`evidencias/04-kirana-api.txt`: `GET /api/kirana/status` → `{"available":true}`;
`/api/health` → `{"ok":true,"service":"opportunity-site","database":"off"}`;
`POST /api/kirana/chat` → `session` + 59 `delta` + `done`; pedido de contratação
→ `start_service_request`; segunda mensagem na mesma sessão → contexto preservado;
`confirm {approve:true}` → `done {executed:true}`; ação inexistente →
`no_pending_action` recuperável; cookie `kirana_sid` **HttpOnly**.

Indisponibilidade testada de verdade (site reiniciado com
`KIRANA_URL=http://127.0.0.1:3999`):

```
GET /api/kirana/status → {"available":false,"reason":"unreachable"}
POST /api/kirana/chat  → HTTP 503
{"error":{"code":"unreachable","message":"Não foi possível falar com o atendimento agora."}}
```

Nenhuma resposta fabricada, e o canal humano continua na tela.

### 2.4 Mocks (declarados como mocks)

- gateway `scripts/mock-gateway.js` em `127.0.0.1:1455`, chave fictícia
  `mock-key-local` — **toda** a evidência de conversa desta rodada usa esse
  gateway;
- o teste `testes/kirana-integracao.mjs` **detecta e avisa**: "gateway:
  SIMULADO (mock-gateway.js) — não é prova de modelo real";
- as respostas do mock trazem "(Resposta do gateway simulado…)", e o modelo
  reportado (`gpt-6-luna`) é o do mock.

### 2.5 Kirana + Gateway reais

- Kirana **v0.5.3 real**, sem alteração de código, rodando de uma cópia local
  (`node src/server.js`, `127.0.0.1:3000`);
- **Gateway/modelo real: não executado** — só existe na máquina Windows do
  responsável. O roteiro completo com critérios de aceite está em
  `docs/INTEGRACAO-KIRANA-REAL.md` §3.

### 2.6 Pendências externas

| # | Pendência | Bloqueia |
|---|---|---|
| K1 | rodar o teste com **gateway real** no Windows | afirmar "Kirana homologada" |
| K2 | decisão de backend público para o site publicado | Kirana no domínio oficial |
| K3 | credenciais de produção como *secret* | publicação |
| K4 | captura real de `rpg-comic-chronicles` (hoje: composição de identidade) | nada (cosmético) |
| K5 | política de retenção de conversas (LGPD) no backend público | recomendável antes de publicar |
| K6 | foto oficial do fundador (decisão: site fica sem imagem) | nada |

## 3. Integração da Kirana — o que o teste prova

`testes/kirana-integracao.mjs` (novo) abre o site num Chromium, clica em
**"Atendente digital"**, digita e envia duas mensagens e confere 14 pontos:
botão no cabeçalho, painel aberto, campo habilitado, mensagem enviada, resposta
recebida, segunda mensagem na mesma conversa, segunda resposta, cookie de sessão,
`httpOnly`, `document.cookie` sem o id, nenhuma chave/token no HTML ou JS,
nenhum endereço interno exposto, nenhum 404, console limpo.

Resultado: **14/14 aprovados** — com gateway simulado.

O botão do cabeçalho abre a **implementação real** (`ResidentKirana` →
`/api/kirana/chat` → Kirana). **Não** redireciona para os cenários do Agente
Adaptativo, que continuam separados e identificados como demonstração.

## 4. Versão estática × Kirana

O GitHub Pages não executa rotas de API: `/api/kirana/*` não existe naquela
publicação. O botão permanece visível no cabeçalho e no menu mobile, mas o
painel informa **"Atendimento indisponível"**, com campo desabilitado, e oferece
WhatsApp/e-mail. Nada é simulado. A proposta de backend público (requisitos,
topologia, segurança, custos, dependências) está em
`docs/INTEGRACAO-KIRANA-REAL.md` §6 — **documentação técnica, sem contratação**.

## 5. Ferramentas novas nesta rodada

| Arquivo | Para que serve |
|---|---|
| `testes/kirana-integracao.mjs` | integração navegador → site → Kirana → gateway; sai com `2` se a Kirana não estiver no ar |
| `testes/capturas.mjs` | regenera as 20 capturas da entrega (desktop/celular) |
| `docs/INTEGRACAO-KIRANA-REAL.md` | evidências, o que falta, roteiro Windows, estático × Kirana, proposta de backend |
| `evidencias/01…04` | saídas reais dos testes, separadas por categoria |

## 6. Como reproduzir

```bash
# site
npm ci
npm run auditar                     # AMBIENTE OK
npm run build:pages                 # estático → out/
node scripts/preview-pages.mjs --no-open &   # prévia em :4400
node scripts/verificar-previa.mjs   # TUDO OK
node testes/pages-estatico.mjs      # TUDO OK
node testes/reorganizacao.mjs       # TUDO OK (estático, 60 ok)

# dinâmico (a Kirana precisa estar no ar)
npm run build
./node_modules/.bin/next start -p 3200 -H 0.0.0.0
node testes/reorganizacao.mjs http://127.0.0.1:3200/   # TUDO OK, 60 ok
node testes/kirana-integracao.mjs http://127.0.0.1:3200 # INTEGRAÇÃO OK
node testes/capturas.mjs                                # 20 PNGs

# Kirana local (cópia; o repositório original não é alterado)
# backend: node src/server.js (127.0.0.1:3000)
# gateway simulado: node scripts/mock-gateway.js --key mock-key-local --namespaced (127.0.0.1:1455)
```

Chromium headless neste ambiente exigiu
`LD_LIBRARY_PATH=/home/user/.cache/debs/root/usr/lib/x86_64-linux-gnu`.

## 7. Ordem de build (evita erro 500 nos chunks)

`npm run build:pages` **sobrescreve** `.next`. Se o site dinâmico estiver no ar
enquanto o build estático roda, os chunks dinâmicos passam a responder **500**.
Sequência correta: `build:pages` → validar estático → `npm run build` →
reiniciar `next start` → validar dinâmico.

## 8. Estado de entrega

- código: correções 1–4 aplicadas; integração 5 validada com gateway simulado;
- testes: **AMBIENTE OK · ESTÁTICO TUDO OK · INTERFACE 60/60 (×2) · KIRANA 14/14**;
- entregáveis: `entregas/opportunity-site-pronto.zip`, `opportunity-site.bundle`,
  20 capturas, `evidencias/`, este relatório e `docs/INTEGRACAO-KIRANA-REAL.md`;
- **nada foi publicado**.
