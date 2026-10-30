# Novo site Opportunity AI + Kirana v0.5.3

Site do redesign com a atendente real ligada ao backend da Kirana v0.5.3.

## Rodar

```bash
npm install
cp .env.example .env.local      # preencha KIRANA_URL (e KIRANA_TOKEN em produção)
npm run build && npm start      # http://127.0.0.1:3000
```

A Kirana precisa estar rodando (repositório separado, `node src/server.js`).
Ordem: **Kirana primeiro, site depois**.

## Três coisas que não se misturam

1. **Atendente real** — botão **"Atendente digital"**, no cabeçalho fixo (e no menu
   mobile). Não há botão flutuante.
   Vai para `/api/kirana/chat` → backend Kirana → nosso Gateway. Streaming,
   ferramentas, memória, contexto da página.
2. **Showcases** — seção "Kirana em Ação". Respostas predefinidas por cenário
   (`/api/chat`). Não chamam modelo, não gastam token. **Não alterar.**
3. **Agente Adaptativo** — o produto comercial. Kirana é a implementação atual
   dele no site da Opportunity AI.

## Endpoints internos

| Rota | Para quê |
|---|---|
| `POST /api/kirana/chat` | conversa real (proxy seguro + cookie httpOnly) |
| `POST /api/kirana/confirm` | confirmação de ação sensível |
| `GET /api/kirana/status` | atendimento disponível? |
| `POST /api/chat` | **só** showcases (`context: "scenario"`) |
| `POST /api/contact` | formulário (grava + webhook opcional, sem promessa falsa) |
| `GET /api/health` | saúde do site |

## Testes

```bash
node testes/integracao.mjs     # 15 verificações (precisa Kirana + gateway mock)
node testes/navegacao.mjs      # 4 verificações (com MOCK_FORCE_TOOL=navigate_to_page)
```

Resultado medido nesta entrega: **15/15** e **4/4**, com gateway mock
(`scripts/mock-gateway.js` do repositório Kirana). **Não** é homologação do
Gateway real.

## Validar com o Gateway real (Windows)

As evidências de integração desta entrega usam **gateway simulado**. Para medir
com o Gateway e o modelo reais, na máquina Windows:

1. Gateway real ligado (o mesmo de sempre — não criar outro);
2. Kirana: `node src\server.js`;
3. site: `npm ci` → `npm run build` → `node_modules\.bin\next start -p 3200`;
4. `VALIDAR-KIRANA-REAL.cmd` (na raiz deste pacote, duplo clique).

O `.cmd` confere Node, sobe o site se preciso, roda o `homologar.bat` da Kirana
quando `KIRANA_DIR` está definida, executa `testes/validar-kirana-real.mjs`
(12 etapas do caminho navegador → site → Kirana → gateway → modelo → navegador)
e grava `homologacao-site/kirana-real-<data>.json`, sem segredos.

Códigos de saída: `0` aprovado com modelo real · `1` etapa falhou ·
`2` dependência ausente · `3` **reprovado: gateway simulado detectado**.

Passo a passo completo, critérios de aprovação e recomendação de backend público:
`docs/INTEGRACAO-KIRANA-REAL.md`.

## Documentação

- `docs/INTEGRACAO-KIRANA-REAL.md` — validação executada, o que falta, roteiro Windows, estático × Kirana, backend público.
- `RELATORIO-FASE-FINAL-KIRANA.md` — respostas objetivas (A–D), problemas e correções, diferenças por rodada.
- `docs/INTEGRACAO-KIRANA.md` — o que foi inspecionado, trocado e por quê.
- `docs/HOSPEDAGEM.md` — frontend + backend, variáveis, Docker, Cloudflare.
- `docs/PENDENCIAS.md` — o que falta (Gateway real, imagens, infra).
