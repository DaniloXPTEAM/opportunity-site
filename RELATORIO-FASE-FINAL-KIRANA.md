# Fase final — validação da Kirana (relatório de diferenças e pendências)

Data: **28/10/2026** · Base: `1b561d4` + rodada `8ba5746`
**Publicação: não autorizada e não executada.** `opportunity.ia.br`, hospedagem,
Kirana e Gateway **não foram alterados**.

---

## Respostas diretas ao §12 do briefing

**A. A Kirana responde com o Gateway e o modelo reais no Windows?**
**Ainda não se sabe** — não tenho acesso à sua máquina Windows, onde estão o
Gateway real e a chave. **Não inventei resultado.** O que ficou pronto é o
instrumento que mede isso: `VALIDAR-KIRANA-REAL.cmd` + `testes/validar-kirana-real.mjs`,
que executa as 12 etapas, **reprova automaticamente** se detectar gateway
simulado (código de saída `3`) e grava JSON sem segredos. Uma execução de ~2
minutos fecha o item A.

**B. A conversa preserva contexto e autorização de ações?**
Com a Kirana **real** e gateway simulado: **sim** (sessão contínua, ferramenta
`start_service_request`, evento `confirmation` com expiração, aprovação
explícita, `no_pending_action` recuperável). Com gateway/modelo reais: é
exatamente o que as etapas 10–12 do script verificam — **pendente de execução**.

**C. Existe correção necessária na integração do site?**
**Não no site** (nenhum arquivo de `src/` mudou nesta fase; as 60/60 + 60/60 +
14/14 da rodada anterior continuam válidas). Encontrei **dois defeitos no próprio
instrumento de teste** e corrigi (§4). Nada indica defeito na ponte.

**D. Que arquitetura permite o atendimento real aos visitantes?**
Site estático onde está + **backend Node dedicado** (apenas
`/api/kirana/{status,chat,confirm}`) atrás de HTTPS, com a Kirana em rede
privada. Recomendação completa, com requisitos, segurança, limites, custos e
sequência de implantação: `docs/INTEGRACAO-KIRANA-REAL.md` §6. **Nada
implementado nem contratado.**

---

## 1. Resultado da validação real

| Item | Estado |
|---|---|
| Executada? | **Não** — o Gateway real e a chave estão na máquina Windows do responsável; o Arena roda em sandbox Linux sem acesso a ela |
| O que existe em vez disso | procedimento executável + script de medição + registro a preencher (§3 do doc) |
| O que **não** foi feito | nenhuma simulação foi apresentada como prova de modelo real |

Transparência sobre o sandbox: em **27–28/10** o caminho navegador → site →
Kirana v0.5.3 → **gateway simulado** foi executado e aprovado (14/14). Nesta
fase o ambiente de execução do Arena foi reiniciado e **não há mais Kirana nem
gateway em execução local**; por isso não reexecutei a bateria antiga (seria
repetir auditoria concluída) e concentrei a fase em produzir o instrumento que
falta.

## 2. Exercício do instrumento (offline, sem alegar homologação)

`evidencias/05-validar-kirana-real-offline.txt` — três cenários contra servidores
de teste locais, para provar que o script **mede e reprova**:

| Cenário | Esperado | Obtido |
|---|---|---|
| nada escutando na porta | código `2` + instrução de subir o site | **código 2**, mensagem correta |
| resposta com texto de gateway simulado | código `3` + explicação | **código 3**, "REPROVADO — assinatura de gateway simulado" |
| resposta sem marca de mock | passar pelos portões e parar na dependência ausente | passou; parou em `Playwright não está instalado` (código 2) |

Isso valida o **instrumento**, não a integração real. A frase correta segue
sendo: *"pronta e testada com gateway simulado; homologação do modelo real
pendente"*.

## 3. Procedimento Windows (pronto para executar)

Documento: `docs/INTEGRACAO-KIRANA-REAL.md` §3 (peças, portas, ordem, as 12
etapas, critérios de aprovação, registro a preencher). Execução:

```bat
:: 1. Gateway real ligado (o mesmo de sempre — não criar outro)
:: 2. Kirana:  node src\server.js
:: 3. (recomendado) homologar.bat   -> aprova o Gateway real pelo lado da Kirana
:: 4. site:    npm ci  &&  npm run build
::              node_modules\.bin\next start -p 3200
:: 5. medir o caminho pelo site:
VALIDAR-KIRANA-REAL.cmd
```

`VALIDAR-KIRANA-REAL.cmd` (novo) confere Node ≥ 20, sobe o site se necessário,
roda o `homologar.bat` da Kirana quando `KIRANA_DIR` está definida, executa a
medição e grava `homologacao-site/kirana-real-<data>.json`. Padrão da
confirmação: **`Cancelar`** (não cria pedido de teste); `--aprovar` executa de
verdade.

Reaproveita o que já existe: `homologar.bat`, `scripts/preflight-gateway.mjs` e
`scripts/homologar-conversa.mjs` do repositório da Kirana. **Nenhum componente
novo foi instalado e nenhum segundo Gateway foi criado.**

## 4. Problemas encontrados e correções mínimas

| # | Problema (encontrado nesta fase) | Correção aplicada | Onde |
|---|---|---|---|
| 1 | o script de validação quebrava com *stack trace* cru se o Playwright não estivesse instalado, antes de qualquer medição | importação sob demanda do Playwright + mensagem objetiva (`npm ci` / `npx playwright install chromium`) | `testes/validar-kirana-real.mjs` |
| 2 | a assinatura de gateway simulado podia chegar **partida entre dois pedaços do streaming** e escapar da detecção | detecção passou a conferir o corpo cru **e** o texto remontado do SSE | `testes/validar-kirana-real.mjs` |
| 3 | o relatório antigo listava "fotografia do fundador" como pendência futura | removida a pendência; registrado que a decisão é **não usar imagem** | `RELATORIO-REORGANIZACAO.md`, `docs/INTEGRACAO-KIRANA-REAL.md` |
| 4 | o relatório antigo ainda descrevia o cartão sem captura com o rótulo "captura em produção" | atualizado para a composição de identidade (correção da rodada anterior) | `RELATORIO-REORGANIZACAO.md` |

Nenhuma alteração em componentes visuais, em Kirana ou em Gateway. **Nenhuma
correção funcional no site foi necessária**, portanto a bateria de regressão da
rodada anterior permanece válida (`src/` idêntico — confirmado por `git diff`).

## 5. Recomendação para o atendimento público (resumo)

`docs/INTEGRACAO-KIRANA-REAL.md` §6, em uma frase: **manter o site estático onde
está e colocar a Kirana atrás de um backend Node pequeno e dedicado**, único
ponto que conhece a credencial, com HTTPS, CORS fechado na origem, limites por
IP e por sessão, cookie `httpOnly`+`Secure`, confirmação explícita de ações e
queda graciosa para "indisponível" + WhatsApp quando o backend não responde.

- **Custo** (ordem de grandeza): ~US$ 4–12/mês de VPS, ou ~US$ 0–7/mês em
  contêiner gerenciado; TLS e subdomínio sem custo novo; tokens do modelo
  variáveis e **não estimados** (dependem do Gateway real).
- **Mudança de código prevista**: uma só — o painel passar a falar com o backend
  por URL absoluta (`NEXT_PUBLIC_KIRANA_API`) com CORS fechado. **Não feita.**
- **Nada contratado, nada publicado, hospedagem intacta.**

## 6. Diferenças em relação à rodada anterior

| Área | Antes (`8ba5746`) | Agora |
|---|---|---|
| `src/` (site) | correções do MD aplicadas | **inalterado** |
| Validação real | roteiro descritivo no doc | **script de medição** com 12 etapas + detecção de mock + JSON sanitizado |
| Execução no Windows | manual, passo a passo | **`VALIDAR-KIRANA-REAL.cmd`** automatiza 5 passos e classifica o resultado |
| Detecção de mock | declarada em texto | **automática e bloqueante** (código 3) |
| Recomendação pública | proposta em 4 opções | **recomendação única** + requisito × como atende + topologia + sequência |
| Pendência "foto do fundador" | listada | **removida** (decisão: sem imagem) |
| Doc de integração | 114 → 290 linhas (5 seções) | reestruturado em 7 seções com registro de execução |
| Testes | 60/60 · 60/60 · 14/14 (simulado) | mesmos resultados, **+ exercício offline do novo instrumento** |
| ZIP | 121 arquivos | **regenerado** (houve alteração de código: 2 arquivos novos + 4 editados) |

## 7. Entregáveis

| # | Entregável | Onde |
|---|---|---|
| 1 | Resultado da validação real | **não executada** — §1 |
| 2 | Procedimento Windows | `docs/INTEGRACAO-KIRANA-REAL.md` §3 + `VALIDAR-KIRANA-REAL.cmd` |
| 3 | Logs sanitizados | `evidencias/01…05` (nenhum segredo; ids truncados) |
| 4 | Lista objetiva de problemas | §4 |
| 5 | Correções mínimas | §4 |
| 6 | Recomendação de atendimento público | §5 + doc §6 |
| 7 | ZIP atualizado | `entregas/opportunity-site-pronto.zip` (+ `.bundle`) — houve alteração de código |
| 8 | Relatório de diferenças | §6 |

## 8. Preservado sem alteração nesta fase

`DiagonalShowcase` · 9 projetos / 5 grupos / estados reais · composição do RPG
Comic Chronicles · Agente Adaptativo como demonstração · identidade visual ·
responsividade · cabeçalho fixo · ausência de botão flutuante · WhatsApp
**(85) 99946-2763** (independente da Kirana) · Sobre com "Danilo de Vasconcelos
Silva — Fundador e CEO", sem imagem/avatar/biografia e sem mencionar foto ·
nenhuma informação de infraestrutura na apresentação comercial · nenhuma imagem
gerada · nada publicado.
