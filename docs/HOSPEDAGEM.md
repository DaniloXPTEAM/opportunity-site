# Hospedagem — Frontend (site) + Backend (Kirana)

Duas peças, dois endereços, uma regra: **o navegador do visitante fala só com o
site**. O site fala com a Kirana pelo servidor dele. A Kirana fala com o Gateway
(nosso projeto separado). Nenhuma chave em código público.

```
visitante ──HTTPS──► site (Next.js)  ──HTTP interno──►  Kirana (Node)  ──►  Gateway  ──►  modelo
                        │                                    │
                     /api/kirana/*                       sessões, memória,
                     (cookie httpOnly)                    ferramentas do site
```

## 1. O que hospedar

| Peça | O que é | Porta padrão | Precisa de domínio? |
|---|---|---|---|
| **Site** | Next.js 16 (App Router) deste projeto | 3000 | sim (`opportunity.ia.br`) |
| **Kirana** | `src/server.js` do repositório Kirana v0.5.3 | 3000 (`KIRANA_PORT`) | não, se o site a alcançar por rede privada |
| **Gateway** | projeto separado | 1455 | ver `docs/GATEWAY-MUDANCAS-PARA-PRODUCAO.md` |

O site **não precisa** de banco de dados para atender visitantes (o Postgres do
template é opcional; `DATABASE_URL` ausente deixou de ser erro de build).

## 2. Variáveis — site

| Variável | Obrigatória | Para quê |
|---|---|---|
| `KIRANA_URL` | sim | endereço da Kirana **visto pelo servidor do site** (ex.: `http://kirana:3000` na rede interna) |
| `KIRANA_TOKEN` | sim em produção | `KIRANA_ACCESS_TOKEN` da Kirana (fica só no servidor) |
| `KIRANA_SITE_ID` | não | `opportunity-ai` (padrão) |
| `KIRANA_TIMEOUT_MS` | não | tempo máximo de resposta (padrão 120000) |
| `SITE_URL` | recomendado | `https://opportunity.ia.br` (metadados/OpenGraph) |
| `CONTACT_WEBHOOK_URL` | opcional | para onde enviar os leads do formulário |
| `DATABASE_URL` | opcional | só se um dia houver banco |

Nunca coloque `KIRANA_TOKEN` em variável `NEXT_PUBLIC_*`: essas vão para o navegador.

## 3. Variáveis — Kirana (resumo; detalhes no README dela)

```bash
KIRANA_ENV=production
KIRANA_ACCESS_TOKEN=<token forte>          # sem isto o servidor não sobe
KIRANA_TRUST_PROXY=true                    # atrás de proxy
KIRANA_ALLOWED_ORIGINS=https://opportunity.ia.br
KIRANA_EMBED_ORIGINS=                      # vazio: o site NÃO usa iframe
KIRANA_AGENT_RATE_MAX=60
KIRANA_GATEWAY_URL=<gateway>
KIRANA_GATEWAY_API_KEY=<chave do gateway>
```

Como o atendimento entra por `/api/kirana/chat` (server-side), **não é preciso**
liberar CORS por origem do visitante nem `frame-ancestors`: quem chama a Kirana é
o servidor do site, não o navegador. Isso reduz a superfície exposta.

## 4. Duas formas de subir

### A. Docker Compose (recomendado) — rede privada + TLS na borda

```yaml
services:
  site:                      # Next.js
    build: .
    environment:
      KIRANA_URL: http://kirana:3000
      KIRANA_TOKEN: ${KIRANA_TOKEN}
      SITE_URL: https://opportunity.ia.br
    expose: ["3000"]
    depends_on: [kirana]

  kirana:                    # backend v0.5.3
    build: ./kirana            # ou imagem própria
    environment:
      KIRANA_ENV: production
      KIRANA_ACCESS_TOKEN: ${KIRANA_TOKEN}
      KIRANA_TRUST_PROXY: "true"
      KIRANA_GATEWAY_URL: ${KIRANA_GATEWAY_URL}
      KIRANA_GATEWAY_API_KEY: ${KIRANA_GATEWAY_API_KEY}
    volumes: ["./kirana-data:/app/data"]
    expose: ["3000"]           # NÃO publique esta porta
```

Nginx/Caddy na borda termina o TLS e encaminha só para `site:3000`.

### B. Duas máquinas / dois serviços

- Site num host (com domínio e TLS).
- Kirana noutro host, acessível **apenas** pela rede privada (VPC/rede do
  provedor), com `KIRANA_URL` apontando para ela.
- Nunca exponha a porta da Kirana na internet: ela tem um token, mas o token não
  substitui uma rede fechada.

## 5. Cloudflare (o que dá e o que não dá)

O site atual roda em Cloudflare. Para este projeto:

| Necessidade | Cloudflare Pages (estático) | Precisa de runtime Node |
|---|---|---|
| Página, CSS, imagens | ✅ | — |
| `/api/kirana/chat` (proxy + cookie) | ❌ | ✅ Pages Functions **ou** outro host |
| Kirana (`src/server.js`) | ❌ | ✅ sempre |
| Sessões/arquivos em disco | ❌ | ✅ volume persistente |

Conclusão honesta: a página pode ficar atrás da Cloudflare (proxy/CDN), mas o
`/api/kirana/*` **precisa** de runtime Node e a Kirana **precisa** de processo
contínuo com disco. Não existe "tudo em plano gratuito ilimitado" — não afirmo
preço nem disponibilidade de plano nenhum: isso é decisão sua, com o provedor.

## 6. Build e execução local (o que foi testado aqui)

```bash
# site
npm install
npm run build           # testado: compila (Turbopack, TS sem erro)
KIRANA_URL=http://127.0.0.1:3000 npm start   # porta 3000

# Kirana (repositório separado)
node src/server.js      # porta 3000 (KIRANA_PORT)
```

Ordem de subida: **Kirana → site**. Se a Kirana estiver fora, o site abre normal,
o painel mostra "Atendimento indisponível" e oferece WhatsApp — nunca inventa
resposta.

## 7. Checklist antes de publicar

- [ ] `KIRANA_ENV=production` e token forte na Kirana (sem token ela não sobe)
- [ ] `KIRANA_TOKEN` igual ao token da Kirana, só no servidor do site
- [ ] porta da Kirana fechada para a internet
- [ ] HTTPS na borda e cookie `secure` (automático com `NODE_ENV=production`)
- [ ] `GET /api/kirana/status` devolve `{"available":true}`
- [ ] conversa real + ferramenta executada + confirmação de ação sensível
- [ ] `/api/chat` respondendo showcases (respostas prontas) e recusando `context: resident`
- [ ] nenhum segredo no bundle: `grep -r "KIRANA_TOKEN\|gateway" .next/static` vazio
- [ ] lead do formulário registrado em `data/leads.jsonl` (ou webhook configurado)
