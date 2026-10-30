# Pendências — o que falta e de quem depende

Separado por natureza, para não confundir defeito do site com falta de material,
de infraestrutura ou de acesso.

## A. Depende de você (material)

**Atualizado em 27/10/2026** — busca concluída: as três imagens abaixo **não existem** em nenhuma
cópia disponível (ZIP do Drive, `public/` recuperado, 23 páginas do sitemap oficial, ZIPs e bundle do
workspace).

| # | Item | Impacto | O que fazer |
|---|---|---|---|
| A1 | `assets/img/rpg-comic-chronicles.jpg` | card do RPG Comic sem captura real (mostra o gradiente do projeto; **não** há 404) | enviar a imagem |
| A2 | `assets/img/processo-inteligente-empresas.jpg` | bloco "processo inteligente" em Soluções sem foto (painel escuro com o texto) | enviar a imagem |
| A3 | `images/lab-cine.jpg` | galeria do CineForma mostra só a captura que existe | enviar a imagem |
| A4 | `public/` completo do redesign | o ZIP do Drive veio **somente** com `src/`: 19 imagens recuperadas do site publicado | enviar o `public/` original, se existir, para conferir as recuperadas |
| A5 | Origem do `hero-kirana-editorial.jpg` etc. | citadas no pedido mas ausentes | confirmar se existem no seu projeto local |

Como funciona hoje: `scripts/gen-assets-manifest.mjs` lista o que existe em `public/` antes de cada
build e os componentes só renderizam arquivos presentes. Quando você enviar as imagens, basta
colocá-las em `public/` e republicar — elas aparecem sem alteração de código.

## B. Depende de acesso (homologação real)

| # | Item | Status |
|---|---|---|
| B1 | `verificar-gateway.bat` + `homologar.bat --full` no Windows com o Gateway real | **não executado** — não tenho o seu Windows |
| B2 | Conversa real, streaming real, ferramenta real pelo Gateway real | **não executado**; testado com o `mock-gateway.js` do repositório Kirana |
| B3 | Modelos disponíveis / autenticação real do Gateway | **não verificado** |

Enquanto B1–B3 não rodarem, a frase correta é: "a integração funciona contra o
gateway de teste e está pronta para homologação", e não "homologada".

## B4. Integração: o que já foi provado e o que falta (28/10/2026)

O caminho navegador → site → Kirana → gateway foi **executado** com a Kirana
v0.5.3 real e **gateway simulado**. Encanamento validado (sessão, streaming,
ferramentas, confirmação, cookie httpOnly, nenhuma credencial exposta); **modelo
real não validado**. Detalhe, resultados e roteiro no Windows em
**`docs/INTEGRACAO-KIRANA-REAL.md`**.

Falta apenas uma execução no Windows (Gateway real ligado):

```bat
VALIDAR-KIRANA-REAL.cmd
```

O script mede as 12 etapas do §3.4 daquele documento, **reprova** (código 3) se
aparecer assinatura de gateway simulado e grava JSON sem segredos em
`homologacao-site/`. A versão estática do GitHub Pages não roda
`/api/kirana/*`: o botão informa indisponibilidade e aponta o WhatsApp — a
recomendação de backend público está no §6 daquele documento.

## C. Depende de infraestrutura (publicação)

| # | Item | Detalhe |
|---|---|---|
| C1 | Host do site (runtime Node) | Cloudflare Pages estático **não** serve: `/api/kirana/*` precisa de servidor. Ver `docs/HOSPEDAGEM.md`. **Para avaliação já existe a versão estática no GitHub Pages** — ver `docs/PUBLICACAO-GITHUB-PAGES.md` |
| C2 | Host da Kirana com processo contínuo e disco | sessões, memória, arquivos de solicitação |
| C3 | Gateway online | bloqueado pelo próprio projeto do Gateway (proíbe exposição pública hoje) — ver `docs/GATEWAY-MUDANCAS-PARA-PRODUCAO.md` no repositório Kirana |
| C4 | Domínio/TLS/porta privada entre site e Kirana | decisão de topologia, não de código |
| C5 | Webhook do formulário (`CONTACT_WEBHOOK_URL`) | sem ele o lead é gravado no disco e o visitante é avisado |
| C6 | Custo do provedor | não contratar nada sem sua autorização |

## C2. Dependências no projeto separado do **Gateway** (lista objetiva)

Nada disso é defeito do site nem da Kirana. O contrato com a Kirana está
congelado: trocar de Gateway = mudar `KIRANA_GATEWAY_URL` e
`KIRANA_GATEWAY_API_KEY`.

| # | O que o Gateway precisa ter para atender visitantes públicos | Por que hoje não atende |
|---|---|---|
| G1 | Deixar de proibir exposição (hoje a própria doc diz "must not be deployed, tunneled, reverse-proxied") | bloqueio declarado no projeto |
| G2 | Autenticação própria de serviço, sem depender de sessão OAuth pessoal | tokens OAuth ficam só em memória |
| G3 | Escutar fora do loopback (hoje o bind é recusado) | impede rodar em servidor |
| G4 | Estado/filas persistentes (sem perder turno em restart) | estado em memória |
| G5 | Observabilidade sem dado sensível (erro, latência, modelo usado) | não há |
| G6 | Limite/quotas por visitante e por chave | hoje é do lado da Kirana apenas |
| G7 | Caminho de homologação com o modelo real (modelos disponíveis, streaming, tool calls) | pendente do seu Windows |

Caminho intermediário honesto: **túnel privado** (G1 parcial) mantém tudo
funcionando, mas **continua dependendo do seu PC ligado** — não cumpre o
requisito "sem depender do meu computador". Detalhe completo em
`docs/GATEWAY-MUDANCAS-PARA-PRODUCAO.md` (repositório da Kirana).

## C3. Atualização do conhecimento do site (§7.5)

Mecanismo que já existe no backend da Kirana, e como o site novo entra nele.
Os comandos `scripts/site-sync.mjs` abaixo são **do repositório da Kirana** —
não existem neste projeto (aqui os scripts são `scripts/build-pages.mjs`,
`scripts/preview-pages.mjs` e `scripts/verificar-previa.mjs`):

| Peça | O que faz |
|---|---|
| `sites/opportunity-ai/site.json` | allowlist de 19 rotas do site publicado + ids de página |
| `sites/opportunity-ai/knowledge/` | documentos revisados por humano (é o que a Kirana **pode** afirmar) |
| `node scripts/site-sync.mjs` | compara sitemap × `site.json` × `knowledge/` e **relata** divergências |
| `node scripts/site-sync.mjs --check` | sai com código 1 quando há divergência (serve para CI) |
| `node scripts/site-sync.mjs --write-snapshots` | salva o texto bruto em `snapshots/` para revisão humana — nunca direto em `knowledge/` |
| `GET /api/site/knowledge` | inspeção do que está carregado (autenticada) |
| `siteContext.refreshIfStale()` | recarrega a base quando ela muda no disco |

O site novo é **página única**: a ponte (`src/lib/kirana.ts`, `sectionToSitePath`)
traduz a seção visível em rota conhecida (`inicio→/`, `solucoes→/solucoes/`,
`projetos→/labs/`, `demo-kirana→/labs/kirana`, …). Quando o conteúdo mudar:

1. `node scripts/site-sync.mjs` (confere rota nova/removida);
2. revisar o texto em `snapshots/` e atualizar `knowledge/` à mão;
3. reiniciar a Kirana (ou esperar `refreshIfStale`).

**Não** existe raspagem automática que reescreva `knowledge/`: isso faria a
Kirana afirmar coisas que ninguém revisou (preços, prazos). Ausência de
documento = ela diz que não tem a informação.

## D0. Publicação estática (GitHub Pages) — 27/10/2026

- `npm run build:pages` → `out/` (51 arquivos, 4,8 MB), com `basePath` `/opportunity-site`;
- 42 caminhos absolutos corrigidos via `src/lib/asset.ts`;
- `.nojekyll` + workflow `.github/workflows/pages.yml`;
- showcases no navegador (mesmas respostas), formulário → WhatsApp oficial, atendente indisponível;
- `testes/pages-estatico.mjs`: **14/14**; dinâmico segue **15/15** e **4/4**.

## D. Feito e verificado nesta entrega

- atendimento real ligado (um único botão, mesma aparência);
- showcases preservados, sem chamada a modelo;
- bloco "resident" falso removido da rota de showcases;
- produto apresentado como **Agente Adaptativo**, Kirana mantida como atendente;
- composição visual do destaque trocada (uma mulher → múltiplas identidades);
- ponte segura: navegador → site → Kirana, cookie `httpOnly`, token só no servidor;
- build de produção compilando; `next build` sem banco;
- formulário sem promessa falsa;
- 15/15 testes integrados + 4/4 de navegação (gateway mock).
