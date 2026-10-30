# Reorganização comercial, visual e de conteúdo — relatório da entrega

Data: 2026-10-28 · Projeto: `opportunity-site` · **Nada foi publicado.**

---

## 1. Resumo em uma página

O site foi reorganizado em torno da jornada comercial, sem reconstrução do zero:

| Antes | Depois |
|---|---|
| 8 seções com nomes internos ("Kirana em Ação", "Catálogo Completo", "Tecnologia") | **8 seções com nomes que o cliente entende** (Início, Soluções, Projetos, Agente Adaptativo, Sobre, Contato + catálogo e processo) |
| Hero com "PRONTA" e métrica "24/7 Atendimento Contínuo" | Hero com a oferta: **"Sua empresa tem um problema? A tecnologia pode ajudar a resolver."** |
| Soluções em linguagem técnica (RAG, workflows, LLM) com métricas inventadas ("38s", "-18h/semana") | **5 problemas do dia a dia**, cada um com problema → como funciona → o que muda → detalhes técnicos recolhidos |
| Catálogo = grade única de 9 cartões iguais, sem estado claro | Catálogo **agrupado por natureza** (5 grupos) e **estado real por projeto** (Conceito / Em desenvolvimento / Demonstração) |
| Metodologia em 5 etapas + "Arquitetura & Engenharia" + "6 pilares" separados | Uma seção **Como trabalhamos**: 4 passos visíveis + técnica recolhida + 6 dúvidas comuns |
| Sobre com cartão "CNPJ & Governança Digital" (domínio, edge, provedores, LGPD) | Uma seção institucional enxuta, com **quem está por trás** e os documentos legais |
| Botão flutuante do agente cobrindo texto | **Eliminado.** Acesso ao atendente pelo cabeçalho fixo (e pelo rodapé) |
| "Kirana em Ação" com selo verde "Atendimento Aberto Agora" | **"Agente Adaptativo"** com legenda de estados e avisos de demonstração |

---

## 2. Seções: preservadas, consolidadas, removidas, alteradas

### Preservadas (sem tocar na identidade)
| Seção | O que foi preservado |
|---|---|
| **Projetos em Destaque** (id `destaques`) | Componente `DiagonalShowcase` intacto: os três painéis trapezoidais, o efeito de aproximação no hover, o clique que abre o detalhe, as imagens reais. Mudou **apenas** o bloco de texto inferior (ver "alteradas"). |
| Formulário → WhatsApp | Mesmo número **(85) 99946-2763**, mesma montagem de mensagem, mesmo aviso de que o envio abre o WhatsApp |
| Imagens | Nenhuma imagem gerada, substituída ou removida |
| Projetos | Os **9 projetos** continuam, com os mesmos textos, funcionalidades e imagens |
| Arquitetura estática + dinâmica | Mesma base de código; `npm run build` e `npm run build:pages` continuam funcionando |
| Integração com a Kirana | Rotas `/api/kirana/*`, componente do atendente e ponte seção → rota intactos |
| Documentos legais | Política de Privacidade e Termos de Uso preservados (seção Sobre) |

### Consolidadas
| De | Para |
|---|---|
| `Solutions` (6 frentes técnicas + 5 etapas + callout) + `Technology` (pipeline + 6 pilares + aviso legal) | **`SolutionsForBusiness`** (oferta comercial) + **`HowWeWork`** (processo + técnica recolhida + dúvidas) |
| `KiranaDemo` ("Kirana em Ação") | **`AgentDemo`** ("Agente Adaptativo"), com a mesma demonstração interativa dos 6 cenários |
| `AboutSection` (missão + cartão de infraestrutura + legais) | **`AboutSection`** enxuta: o que faz, propósito, quem está por trás, documentos |

### Removidas
- Cartão **"CNPJ & Governança Digital"** (domínio, "Cloudflare Pages Edge", provedores de IA, "em conformidade com a LGPD").
- Exposição de infraestrutura no rodapé ("Publicação: Cloudflare Pages Edge").
- Métricas inventadas dos cartões de solução: **"38s resposta média"**, **"24/7 cobertura contínua"**, **"100% contatos registrados"**, **"-18h tarefas manuais/semana"**, **"<1s latência de fala"**, **"Piloto em 14 dias"**, **"10 dias"**.
- Promessas absolutas: **"Sem Alucinação"**, **"Piloto entregue em até 14 dias"**, **"Supervisão humana garantida"**, **"em menos de duas semanas"**.
- Selo **"PRONTA"** e métrica **"24/7 Atendimento Contínuo"** no hero.
- Selo **"Atendimento Aberto Agora"** e pontinho verde pulsante no cabeçalho do chat de demonstração.
- **Botão flutuante** do agente.
- Filtros do catálogo por tipo de mídia ("Gestão & CRM", "RPG & Games"), que não informavam estado.

### Alteradas
| Item | Mudança |
|---|---|
| Cabeçalho | 6 itens (Início, Soluções, Projetos, Agente Adaptativo, Sobre, Contato) + botão **"Fale sobre seu projeto"** + **"Atendente digital"**. Item ativo acompanha a rolagem. |
| Hero | Título e texto do briefing; CTA "Conte o desafio" e "Conheça nossos projetos"; no lugar das métricas de promessa, **fatos verificáveis** (5 frentes, 9 projetos, 1 conversa) e a conversa ilustrativa marcada como **EXEMPLO**. |
| Ordem da página | início → **soluções** → projetos em destaque → agente → catálogo → processo → sobre → contato (comercial primeiro). |
| Projetos em Destaque (texto inferior) | O bloco que repetia a institucional ("Sobre nós / Mais que tecnologia") virou **"O que esses projetos demonstram"**, com botão para Soluções — sem repetir o discurso da seção Sobre. |
| Catálogo | 5 grupos por natureza + estado por projeto + legenda de estados. Cartão sem captura mostra o monograma e a identidade do projeto em vez de gradiente vazio (o rótulo "captura em produção" foi removido na rodada seguinte). |
| Agente Adaptativo | Título e texto do briefing, **legenda de 4 estados** (simulação interativa / integração funcional / em desenvolvimento / atendimento comercial), nota sobre o que a versão publicada faz, banner final sem promessa de prazo. |
| Sobre | Seção única, com **"Quem está por trás"** (Danilo de Vasconcelos Silva, nome social Rafael Nobre, Fortaleza/CE). **Sem imagem por decisão** — nenhuma foto, avatar ou espaço reservado, e nada no texto sobre isso. |
| Contato | Título "Conte o desafio da sua empresa" e texto do briefing; lista de interesse reescrita em linguagem de negócio ("Atendimento ao cliente", "Organizar clientes e vendas", …, "Não sei ainda — quero orientação"); botão diz **"Continuar no WhatsApp"** na versão estática. |
| Rodapé | Navegação e coluna de soluções em linguagem simples; sem infraestrutura. |
| Botão do atendente | Era flutuante (cobria texto). Agora é um item do cabeçalho fixo + botão no menu mobile + acesso pelo bloco de demonstração. |

---

## 3. Identidade visual

O sistema existente foi mantido e **uniformizado** (a inconsistência vinha de cada seção inventar seu tom):

| Elemento | Padrão aplicado |
|---|---|
| Tipografia | `Plus Jakarta Sans` (texto) + `Sora` (títulos). Uma família, duas funções. |
| Hierarquia | H1 4xl→58px · H2 3xl→5xl · H3 xl/2xl · corpo 16-18px · apoio 12-14px |
| Paleta | Azul `#2563eb` (ação), slate-900 (texto/fundos escuros), slate-50 (fundos), emerald (estado positivo), âmbar (atenção/estado) |
| Espaçamento | Seções `py-20` / `sm:py-24`; cartões `p-5`/`p-6`; grid 5-6 de gap |
| Cartões | `rounded-2xl border border-slate-200` + hover `border-blue-300 shadow-lg` em todo o site |
| Botões | Primário (azul, pill), secundário (branco com borda), texto com seta |
| Fundos | Alternância intencional claro → branco → claro, com **uma** seção escura (demonstração do agente e cartão do fundador) |

---

## 4. Resultado dos testes

### Estático (prévia em `/opportunity-site/`)
| Teste | Resultado |
|---|---|
| `npm run auditar` | **AMBIENTE OK** |
| `node scripts/verificar-previa.mjs` | **TUDO OK** — CSS `text/css`, JS `text/javascript`, 0 JS recebendo HTML, `public/` 22/22 |
| `node testes/pages-estatico.mjs` | **18/18 OK** — imagens 17/17 no DOM, CSS aplicado, atendente indisponível, WhatsApp oficial |
| `node testes/reorganizacao.mjs` (novo) | **TUDO OK** em 1440×900, 768×1024 e 390×844 |

O `testes/reorganizacao.mjs` verifica, em três tamanhos de tela:
1. as 8 seções na ordem nova;
2. o menu levando a cada seção (com o cabeçalho fixo respeitado: margem de 92px);
3. **Projetos em Destaque** abrindo e fechando o detalhe;
4. os **9 projetos** preservados, em 5 grupos, todos com estado;
5. o formulário montando o link `wa.me/5585999462763` com a mensagem preenchida;
6. **nenhum botão flutuante** sobre o conteúdo;
7. **nenhuma rolagem horizontal** (inclusive em 390px);
8. zero recurso 404 e console limpo.

### Dinâmico (mesma base de código)
| Verificação | Resultado |
|---|---|
| `npm run build` | OK — rotas `/`, `/api/chat`, `/api/contact`, `/api/health`, `/api/kirana/{chat,confirm,status}` preservadas |
| `next start` → `/` | 200 `text/html` |
| `/api/health` | 200 `application/json` |
| `/api/chat` (contexto `scenario`) | resposta real do showcase da padaria |
| `/api/kirana/status` | 200 — `{"available":false,"reason":"unreachable"}` (Gateway não está ligado neste ambiente; comportamento esperado, sem inventar disponibilidade) |

### Defeitos encontrados durante a validação (e corrigidos)
1. **Capas dos projetos não apareciam** — `hasAsset()` comparava o caminho já prefixado (`/opportunity-site/assets/...`) com o manifesto, que lista sem prefixo. Falha antiga, exposta ao reorganizar o catálogo. Corrigido em `src/lib/media.ts`.
2. **Destaque do título vazava** para fora da coluna (o `.marker` usava `white-space: nowrap`). Agora quebra junto com o texto.
3. **Botão flutuante cobria texto** — mesmo compacto, no celular batia em 28 posições de rolagem. Removido.
4. **Menu mobile parava longe do alvo** — a navegação era disparada no mesmo evento que fechava o menu, com o layout antigo. Agora fecha e navega no quadro seguinte.
5. **Títulos escondidos atrás do cabeçalho fixo** — adicionada margem de rolagem de 92px.

---

## 5. O que **não** foi feito (de propósito)

- Nenhuma imagem gerada, nenhuma foto de banco de imagens no lugar do fundador.
- Nenhum cliente, depoimento, métrica ou funcionalidade inventada.
- Nenhuma alteração em Kirana ou Gateway.
- Nada publicado; `opportunity.ia.br` intocado.
- A imagem de referência do mascote (blob azul) foi **guardada** em `referencias/mascote-blob-azul-referencia.png`, fora do site, sem uso nesta entrega.

## 6. Pendências que dependem de você

1. **Captura do RPG Comic Chronicles** — único projeto sem imagem no pacote (o cartão mostra a identidade do próprio projeto).
2. **Preço e prazo** — hoje o site diz que são definidos após a conversa. Se quiser faixas públicas, é uma decisão comercial sua.
3. **Aprovação visual** — nada será publicado sem o seu aval.

> Fotografia do fundador **não** é pendência: a decisão é não usar imagem.
> "Captura em produção" **não** aparece mais na interface (corrigido depois).
