# Integração Kirana v0.5.3 × novo site Opportunity AI

Registro do que foi inspecionado, o que foi trocado e por quê. Nada aqui é
simulação de homologação: o que foi medido usou **gateway mock**; a coluna
"Gateway real" segue pendente do Windows do operador.

## 1. O que veio no ZIP e o que não veio

O ZIP `opportunity-ai-website-redesigntestar essa.zip` traz **27 arquivos**:
`src/app`, `src/components`, `src/data`, `src/db`, configs e `package.json`.
**Não traz `public/`** — ou seja, **nenhuma imagem**. Também não traz `.git`,
`README` nem `node_modules`.

Imagens referenciadas pelo código: 26. Situação:

| Situação | Quantidade | Arquivos |
|---|---|---|
| recuperadas do site publicado (`https://opportunity.ia.br/assets/...`) | 20 | logos, `kirana-1..3`, `crm`, `gabi`, `mordenrpg-*`, `armada-nexus-*`, `studio-*`, `creators-*`, `cineforma`, `og-image`, `favicon` |
| **ausentes em todo lugar** | 6 | `hero-kirana-editorial.jpg`, `hero-armadanexus.jpg`, `hero-mordenrpg.jpg`, `opportunity-crm-modern.jpg`, `processo-inteligente-empresas.jpg`, `rpg-comic-chronicles.jpg` |

Tratamento das ausentes:
- `hero-armadanexus` → `armada-nexus-2.jpg` (mesma mesa virtual, captura real);
- `hero-mordenrpg` → `mordenrpg-inicio.jpg` (mesmo projeto, captura real);
- `opportunity-crm-modern` → `opportunity-crm.jpg` (mesmo CRM, captura real);
- `hero-kirana-editorial` → **nova composição** `hero-agent-adaptive.jpg` (§3);
- `rpg-comic-chronicles` e `processo-inteligente-empresas` → **sem material**:
  a referência é preservada e o card usa o gradiente do próprio projeto como
  fundo, para não exibir retângulo vazio. **Precisamos desses dois arquivos.**

## 2. Três funções distintas (e como ficaram separadas no código)

| Função | Onde vive | Fala com modelo? |
|---|---|---|
| **Atendente real** (Kirana) | `ResidentKirana.tsx` → `/api/kirana/chat` → Kirana → Gateway | sim |
| **Showcases** (padaria, pet, loja, RPG, WhatsApp…) | `KiranaDemo.tsx` → `/api/chat` (`context: "scenario"`) | **não** — tabela de respostas prontas |
| **Produto comercial** (Agente Adaptativo) | textos do Hero, destaque, Tecnologia, contato, SEO | — |

O `src/app/api/chat/route.ts` tinha, além dos showcases, um bloco "resident
mode" com ~10 respostas fixas que **fingiam ser a atendente** ("Sou a Kirana...",
"Acabei de carregar o cenário da Padaria..."). Esse bloco foi **removido**: manter
as duas coisas no mesmo site seria ter uma atendente falsa ao lado da real. A
rota agora só aceita `context: "scenario"` e devolve 400 para o resto. Os
showcases seguem idênticos (mesmas perguntas, respostas, personagens, animações).

## 3. Imagem do destaque: de uma mulher para o produto

Diagnóstico do arquivo de referência `src/components/DiagonalShowcase.tsx`: o
painel 1 é o maior da página e representava o produto com **um retrato de uma
mulher** (`hero-kirana-editorial.jpg`, ausente no ZIP). O problema apontado pelo
proprietário era exatamente esse: uma única identidade como representação
universal de um produto que assume várias.

**Descoberta que mudou a solução:** `kirana-1.jpg`, `kirana-2.jpg` e `kirana-3.jpg`
**não são a mesma pessoa** — são três identidades do mesmo agente (mulher de cabelo
turquesa; homem de óculos; pessoa de cabelo prateado em traje tecnológico). O
próprio projeto já tinha o material certo para comunicar "muitas identidades", então
a composição deixou de ser gerada por IA e passou a ser **montada com os ativos
reais**:

- as **três identidades reais** (`kirana-1/2/3.jpg`) em cartões em cascata — o
  argumento do produto aparece por evidência, não por ilustração;
- **telas reais** dos projetos: `opportunity-crm.jpg` (funil + mensageiro),
  `armada-nexus-2.jpg` (mesa de RPG) e `gabi-interface-oficial.jpg` (aplicativo);
- fundo derivado dos tokens do site (navy → azul), vinheta na base e à esquerda.

Montada com PIL a partir dos arquivos originais: nenhuma imagem externa, nenhuma
identidade inventada.

Paleta: navy `#0a1f44`, azul `#2563eb`, ciano `#06b6d4`, âmbar quente — os
mesmos tokens de `globals.css`. O terço esquerdo ficou mais escuro para o título
e o texto brancos continuarem legíveis (o painel tem `clip-path` diagonal e
gradiente de vinheta por cima).

Texto do painel: título **Agente Adaptativo** com a descrição canônica do produto
(§3.3 do briefing) — assume identidades, personalidades e funções para atuar em
sites, aplicativos, atendimento, mensageiros e jogos, usando o conhecimento e as
ferramentas de cada ambiente; "aqui ele atende como Kirana".

O item **"Kirana"** do catálogo (`portfolio.ts`) ficou **como está**: ali a Kirana é
o projeto do Labs, com suas próprias capturas. É exatamente a distinção pedida:
produto genérico = Agente Adaptativo; a atendente e o projeto = Kirana.

Não troquei mais nenhuma imagem do portfólio além das referências quebradas.

## 4. O que foi reescrito no atendente (interface preservada)

`ResidentKirana.tsx` mantém **a mesma aparência**: mesmo botão flutuante
gradiente, mesmo painel 420px, mesmo cabeçalho escuro, mesmas cores, mesmas
bordas. O que mudou é a lógica:

| Antes | Agora |
|---|---|
| `POST /api/chat` com `context: "resident"` | `POST /api/kirana/chat` (servidor → Kirana) |
| resposta única, texto fixo | streaming SSE (delta por delta) |
| sem ferramentas | pills de ferramenta (`consultar serviços`, `navegar`, …) |
| sem contexto de página | seção visível vai junto (`IntersectionObserver` → rota equivalente) |
| sem estado real | ponto verde = `GET /api/kirana/status` de verdade |
| abrir por `CustomEvent` (quebrava) | abre pelo handler do React; o evento continua para compatibilidade |
| erro genérico | mensagem específica + botão "Tentar novamente" + WhatsApp |

Também foram adicionados: confirmação explícita para ação sensível (usa
`/api/kirana/confirm`, nunca executa sozinho) e execução de diretivas
`site_action` (navegação autorizada pela Kirana).

## 5. Segurança da ponte

- Navegador → site → Kirana. **Nenhuma** chamada direta do navegador à Kirana.
- Token da Kirana só na variável de ambiente do servidor (`KIRANA_TOKEN`).
- Sessão do visitante em cookie **`httpOnly`** (`kirana_sid`); o id vem da Kirana,
  nunca é gerado nem lido pelo cliente.
- IP repassado por `X-Forwarded-For` para o limite por IP da Kirana continuar
  sendo por pessoa.
- Nenhuma resposta é fabricada: Kirana fora do ar → 503 + canal humano.
- `/api/chat` (showcases) não chama modelo: zero token.
