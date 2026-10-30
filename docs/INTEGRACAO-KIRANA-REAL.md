# Integração do site com a Kirana — validação executada e o que falta

Documento técnico (fora do conteúdo visível do site) sobre o caminho
**navegador → site → Kirana → Gateway/modelo → Kirana → navegador**.

Resumo honesto, antes de qualquer detalhe:

| Camada | Estado nesta rodada | Prova |
|---|---|---|
| Site (Next.js 16.2.6) → rotas `/api/kirana/*` | **funciona** | curl + teste de navegador |
| Rotas → backend Kirana **real v0.5.3** (HTTP, `127.0.0.1:3000`) | **funciona** | id de sessão devolvido pela Kirana, `tool_start`/`tool_result`, evento `confirmation` |
| Kirana → **Gateway** | executado com o **gateway simulado** (`scripts/mock-gateway.js`) | ⚠️ **não** prova modelo real |
| Kirana → **Gateway/modelo real** | **não executado** — só existe na máquina Windows do responsável | ❌ pendente |
| Site estático (GitHub Pages) | não roda rota de API → o botão informa indisponibilidade | ver §5 |

Ou seja: **o encanamento está validado; a qualidade da resposta do modelo não.**
Nada aqui deve ser lido como homologação em produção.

---

## 1. Ambiente usado (Linux, sandbox)

| Peça | Versão / endereço |
|---|---|
| Site | Next.js 16.2.6, `next start -p 3200` |
| Kirana | **v0.5.3 real** — cópia de `/home/user/repo-push` (repositório original **não foi alterado**), `node src/server.js` em `127.0.0.1:3000` |
| Gateway | `scripts/mock-gateway.js --key mock-key-local --namespaced` em `127.0.0.1:1455` (**simulado**) |
| Variáveis do site | `KIRANA_URL=http://127.0.0.1:3000`, `KIRANA_SITE_ID=opportunity-ai`, sem token (Kirana local em modo desenvolvimento) |
| Variáveis da Kirana | `KIRANA_ENV=development`, gateway `http://127.0.0.1:1455`, chave fictícia `mock-key-local` |

A Kirana guarda a credencial do gateway; o site nunca a vê. `KIRANA_TOKEN`
(quando a Kirana exige autenticação) fica **somente** no servidor do site e nunca
em `NEXT_PUBLIC_*`.

## 2. Como foi validado

### 2.1 Teste de navegador automatizado — `testes/kirana-integracao.mjs`

Abre o site num Chromium real, clica no botão **"Atendente digital"** do
cabeçalho, digita, envia duas mensagens e inspeciona o que chegou.

```bash
node testes/kirana-integracao.mjs http://127.0.0.1:3200
```

Verificações (todas aprovadas nesta rodada):

1. `/api/kirana/status` responde `{"available":true}`;
2. botão "Atendente digital" presente no cabeçalho;
3. o painel do atendente abre;
4. o campo de mensagem fica habilitado (é atendimento real, não demonstração);
5. a mensagem do visitante aparece na conversa;
6. a resposta da Kirana chega à interface;
7. a segunda mensagem entra na **mesma** conversa;
8. a segunda resposta também chega (contexto preservado);
9. existe cookie de sessão `kirana_sid`;
10. o cookie é `httpOnly` (invisível para JavaScript da página);
11. `document.cookie` não expõe o id de sessão;
12. nenhuma chave/token no HTML ou no JS público;
13. nenhum endereço interno da Kirana ou do gateway exposto ao navegador;
14. nenhum recurso 404; console sem erros.

O teste **detecta sozinho** que o gateway é simulado e imprime o aviso; ele nunca
declara "modelo real validado". Se a Kirana não estiver no ar, o script sai com
código `2` e diz qual dependência externa falta — não inventa resultado.

### 2.2 Verificação direta nas rotas (curl)

| Passo | Resultado observado |
|---|---|
| `GET /api/kirana/status` | `{"available":true}` |
| `POST /api/kirana/chat` — "Olá, quais soluções vocês têm para uma padaria?" | `session` (`s_2c826b7e-…`) + deltas + `done` |
| 2ª mensagem na mesma sessão | `tool_start` / `tool_result` + 25 deltas ⇒ **contexto preservado** |
| "Quero contratar um agente de atendimento para minha loja" | chamada da ferramenta `start_service_request` |
| "Pode enviar o pedido de contato agora" | evento `confirmation` — ação `act_fbbcb367`, `submit_service_request`, solicitação `REQ-2026-E2A436`, `expiresAt` |
| `POST /api/kirana/confirm {actionId, approve:true}` | `tool_result {ok:true, executed:true}` |
| `POST /api/kirana/confirm {actionId:"act_inexistente"}` | erro recuperável `no_pending_action` (HTTP 200 no stream) — comportamento correto |
| Cabeçalho `Set-Cookie` | `kirana_sid=…; HttpOnly` |

**Fluxo de confirmação**: nada sensível é executado sem aprovação explícita do
visitante; o botão de aprovar chama `/api/kirana/confirm`, e a ação expira.

### 2.3 O que estes resultados NÃO provam

- qualidade, tempo e custo das respostas de um **modelo real**;
- comportamento com o gateway real (limites, timeout, erros do provedor);
- volume simultâneo, abuso, rate limit em carga;
- qualquer coisa em produção (`opportunity.ia.br` não foi tocado).

## 3. Procedimento no Windows (gateway/modelo reais)

Nada aqui foi executado pelo Arena: o Gateway real está na máquina do
responsável. O procedimento é curto de propósito e reaproveita o que o
repositório da Kirana já tem — **não** cria um segundo Gateway nem instala
componente novo.

### 3.1 Peças e portas

| Peça | Como iniciar | Porta | Variáveis |
|---|---|---|---|
| Gateway real | o mesmo que já atende a Kirana (janela dele, `/auth/start` concluído) | a dele (1455 por padrão) | `GATEWAY_API_KEY` (só no `.env` dele) |
| Kirana v0.5.3 | `node src\server.js` na pasta dela | 3000 | `KIRANA_GATEWAY_URL`, `KIRANA_GATEWAY_API_KEY`, `KIRANA_ENV` |
| Site dinâmico | `npm ci` (1ª vez) → `npm run build` → `node_modules\.bin\next start -p 3200` | 3200 | `.env.local`: `KIRANA_URL=http://127.0.0.1:3000`, `KIRANA_SITE_ID=opportunity-ai`, `KIRANA_TOKEN` se a Kirana exigir |

Portas livres: 1455 (gateway), 3000 (Kirana), 3200 (site). Verificação rápida:
`http://127.0.0.1:3000/health` deve responder `{"status":"ok","app":"Kirana","version":"0.5.3"}`.

### 3.2 Ordem de execução (o que fazer, em que ordem)

```
1. Gateway real ligado                      →  conferir /health e /auth/status
2. Kirana:  node src\server.js               →  log "Kirana v0.5.3 ouvindo"
3. (recomendado) homologar.bat               →  aprova o Gateway real por conta
   na pasta da Kirana                          própria (doctor + preflight + conversa)
4. Site:    npm ci  →  npm run build
            node_modules\.bin\next start -p 3200
5. VALIDAR-KIRANA-REAL.cmd                   →  mede o caminho pelo site
```

O passo 3 é opcional e não substitui o 5: o `homologar.bat` prova
**Kirana → Gateway → modelo**; o passo 5 prova **navegador → site → Kirana →
Gateway → modelo → navegador**, que é o critério de homologação do site.

### 3.3 O que o `VALIDAR-KIRANA-REAL.cmd` faz

1. confere Node ≥ 20;
2. confere o site em `:3200` e, se preciso, sobe em outra janela (sem matar nada);
3. roda o `homologar.bat` da Kirana **se** `KIRANA_DIR` estiver definida;
4. roda `node testes/validar-kirana-real.mjs`, que executa as 12 etapas do
   §3.4 e grava `homologacao-site/kirana-real-<data>.json`;
5. imprime o código de saída e o que anexar ao relatório.

```bat
VALIDAR-KIRANA-REAL.cmd              :: recusa a ação (não cria pedido)
VALIDAR-KIRANA-REAL.cmd --aprovar    :: aprova (cria solicitação REAL na Kirana)
set KIRANA_DIR=C:\caminho\da\kirana  :: roda também o homologar.bat
```

Códigos de saída: `0` aprovado com modelo real · `1` etapa falhou ·
`2` dependência ausente (site, Kirana ou Playwright) · `3` **reprovado por
assinatura de gateway simulado**.

### 3.4 As 12 etapas e o que é considerado aprovado

| # | Etapa | Como o script confere | Aprovado quando |
|---|---|---|---|
| 1 | Gateway real disponível | `homologar.bat` / `preflight` da Kirana | `/health` e `/auth/status` ok |
| 2 | Gateway autorizado | idem | conta autorizada, escopos certos |
| 3 | Kirana real no ar | `GET /api/kirana/status` pelo site | `{"available":true}` |
| 4 | Kirana alcança o Gateway | resposta da 1ª mensagem | texto do **modelo** (sem assinatura de mock) |
| 5 | Site dinâmico no ar | status + stream | HTTP 200 no SSE |
| 6 | Página abre no navegador | Playwright | painel abre, campo habilitado |
| 7 | Botão "Atendente digital" | clique real | painel do atendente visível |
| 8 | Envio de mensagem | digitação real | mensagem aparece e resposta chega |
| 9 | Resposta do modelo real | `done.model`, `ttftMs`, texto | conteúdo de negócio, **sem** "gateway simulado" |
| 10 | 2ª mensagem na sessão | mesmo cookie `kirana_sid` | nenhuma sessão nova emitida |
| 11 | Contexto preservado | texto da 2ª resposta | cita o assunto anterior / mesma sessão |
| 12 | Ação com confirmação | evento `confirmation` + botões na tela | pede autorização antes de executar; `Cancelar` não executa (ou `--aprovar` executa e registra) |

O script **reprova automaticamente** (código 3) se aparecer qualquer marca de
gateway simulado — inclusive se a marca vier partida entre dois pedaços do
streaming. Ele também falha se não houver evento `confirmation` antes de uma
ação de contato.

### 3.5 Registro de execução (preencher no Windows; nada aqui foi inventado)

| Etapa | Resultado | Modelo declarado | Observação |
|---|---|---|---|
| 1–2 Gateway | *(pendente)* | — | |
| 3–5 Kirana + site | *(pendente)* | — | |
| 6–9 navegador + resposta | *(pendente)* | — | |
| 10–11 contexto | *(pendente)* | — | |
| 12 confirmação | *(pendente)* | — | |

Enquanto essa tabela estiver vazia, a frase correta é: **"integração pronta e
testada com gateway simulado; homologação do modelo real pendente"** — nunca
"homologada".

## 4. Segurança da ponte (já implementada)

- o navegador conversa **apenas** com o próprio site; nunca com a Kirana ou o gateway;
- credencial da Kirana só em variável de ambiente de servidor;
- sessão do visitante em cookie `httpOnly` (`kirana_sid`), id emitido pela Kirana;
- IP repassado por `X-Forwarded-For` para o limite por IP da Kirana continuar sendo por pessoa;
- Kirana fora do ar → HTTP 503 + canal humano; **nenhuma resposta é inventada**;
- ações sensíveis exigem confirmação explícita e expiram;
- `/api/chat` (cenários de demonstração) não chama modelo: zero token.

## 5. Versão estática (GitHub Pages) × Kirana

O GitHub Pages serve **arquivos estáticos**. Não existe processo Node lá, logo
`/api/kirana/chat`, `/api/kirana/status` e `/api/kirana/confirm` **não podem
existir** nessa publicação. Consequências, já implementadas:

- o build estático usa `NEXT_PUBLIC_STATIC_EXPORT=1`;
- o botão **"Atendente digital"** continua visível no cabeçalho e no menu mobile,
  mas o painel informa **indisponibilidade** e direciona ao WhatsApp/e-mail —
  não simula conversa, não finge atendente;
- os cenários do **Agente Adaptativo** continuam funcionando no estático porque
  são tabela de respostas prontas no próprio JavaScript (`src/lib/showcase.ts`);
- a Kirana real continua acessível na versão **dinâmica** (Node), não no Pages.

Estado do botão no estático: **"indisponível" honesto**. Nada de resposta falsa.

## 6. Recomendação para o atendimento público (não implementada)

Objetivo: visitante conversar com a Kirana real no domínio publicado, sem
mexer na hospedagem atual antes de autorização.

### 6.1 Recomendação em uma frase

**Publicar só o site estático onde ele já está e colocar a Kirana atrás de um
backend pequeno, dedicado, em outro host** — um processo Node que expõe apenas
`/api/kirana/{status,chat,confirm}`, fala com a Kirana por rede privada e é o
único ponto que conhece a credencial. O site estático continua estático; quando
o backend não responde, o botão volta a dizer "indisponível" (comportamento que
já existe hoje).

Por que não as alternativas óbvias:

- **Servir o site inteiro em Node só para ter a Kirana** — resolve, mas troca uma
  publicação estável (Pages) por um servidor que passa a ser ponto único de
  falha do site inteiro. Não recomendo antes de haver tráfego que justifique.
- **Função de borda/serverless de curta duração** — SSE de resposta longa é
  exatamente o caso em que limite de execução atrapalha. Só com plano pago e
  teste de streaming.
- **Chamar a Kirana direto do navegador** — inaceitável: exporia a credencial e o
  endereço interno, e o `httpOnly` deixaria de proteger a sessão.

### 6.2 Como cada requisito é atendido

| Requisito | Como |
|---|---|
| Backend acessível pela internet | processo Node 20+ atrás de HTTPS, com as três rotas e `/api/health` |
| Comunicação segura | TLS no domínio, HSTS, CORS fechado na origem do site; Kirana fora da internet (rede privada/túnel, nunca porta aberta) |
| Proteção de credenciais | `KIRANA_TOKEN` e a chave do Gateway só como *secret* do servidor; nada em `NEXT_PUBLIC_*`; nada em HTML/JS; log sem segredo |
| Controle de uso | limite por IP **e** por sessão, tamanho máximo de mensagem/histórico, timeout de upstream, teto diário de conversas; o site já repassa `X-Forwarded-For` |
| Sessões independentes | cookie `kirana_sid` `httpOnly` + `Secure` + `SameSite=Lax`; o id vem da Kirana, o backend não guarda estado próprio |
| Confirmação de ações | `confirmation` → `POST /api/kirana/confirm` com aprovação explícita e expiração; nada sensível executa sozinho |
| Indisponibilidade | 503 com mensagem humana + WhatsApp/e-mail na tela; nenhuma resposta fabricada; alerta de monitoramento |
| Custos | ver 6.4; sem contratar nada agora |
| Compatibilidade com a versão estática | o estático continua igual: `NEXT_PUBLIC_STATIC_EXPORT=1` deixa o botão em modo "indisponível". A virada é uma variável (`KIRANA_URL` pública + rebuild) **ou** manter o estático e apontar o painel para o backend em subdomínio — decisão na 6.5 |

### 6.3 Topologia sugerida

```
visitante ──HTTPS──► site estático (Pages/CDN, como hoje)
                     └── botão "Atendente digital" ──fetch──► api.dominio (backend Node)
                                                                  │ rede privada + token
                                                                  ▼
                                                          Kirana v0.5.3 ──► Gateway ──► modelo
```

Detalhe importante: hoje o site é **um único processo** que serve página e API.
Ao separar, o painel precisa falar com o backend por URL absoluta configurada no
build (`NEXT_PUBLIC_KIRANA_API`), com CORS fechado para a origem do site. Essa é
a única mudança de código prevista — pequena, e **não feita nesta fase**.

### 6.4 Custos (ordem de grandeza, sem contratação)

| Item | Faixa típica |
|---|---|
| VPS 1 vCPU / 1 GB (backend Node) | ~US$ 4–12 / mês |
| Contêiner gerenciado (alternativa mais simples) | ~US$ 0–7 / mês no plano inicial |
| TLS | gratuito (Let's Encrypt / provedor) |
| Domínio do backend | subdomínio do domínio atual, sem custo novo |
| Tokens do modelo | variável — depende do Gateway real e do volume; **não estimado aqui** |
| Monitoramento | plano gratuito costuma bastar no início |

Valores de referência de mercado; reconferir na contratação.

### 6.5 Sequência sugerida (quando houver autorização)

1. rodar o §3 no Windows e anexar o JSON do `validar-kirana-real.mjs`;
2. decidir o host do backend (VPS ou contêiner) e a origem do token;
3. subir o backend com as três rotas, TLS e limites; manter a Kirana em rede privada;
4. apontar o painel do site para o backend (`NEXT_PUBLIC_KIRANA_API`) e rebuildar;
5. testar no estático: conversa real, contexto, confirmação, indisponibilidade
   (derrubar o backend e conferir a mensagem), carga leve;
6. só então publicar — com aprovação do responsável.

## 7. Pendências

| # | Pendência | Bloqueia? |
|---|---|---|
| K1 | rodar `testes/kirana-integracao.mjs` no Windows com gateway real | bloqueia a afirmação "Kirana validada de ponta a ponta" |
| K2 | decidir hospedagem do backend público (§6) | bloqueia a Kirana no domínio publicado |
| K3 | credenciais de produção como *secret* | bloqueia publicação |
| K4 | captura real de `rpg-comic-chronicles` (cartão usa composição de identidade própria) | não bloqueia |
| K5 | política de retenção de conversas (LGPD) no backend público | recomendável antes de publicar |
