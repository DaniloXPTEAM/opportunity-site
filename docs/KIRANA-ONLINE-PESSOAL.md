# Kirana online no site da Opportunity — uso pessoal

**Escopo:** a Kirana da Opportunity atende o **site da Opportunity** (GitHub Pages) a partir do **seu PC**,
usando o **seu Gateway**. É para uso pessoal e teste. Não é o kit de produção para clientes, não atende
outros sites e não faz pedido nem WhatsApp (isso é do agente do cliente).

```
visitante → https://daniloxpteam.github.io/opportunity-site  (site estático)
              │  carrega o widget e fala com a Kirana
              ▼
         https://kirana.opportunity.ia.br   (Cloudflare Tunnel, só rotas liberadas)
              ▼
         Kirana  127.0.0.1:3000   (no seu PC)
              ▼
         Gateway 127.0.0.1:1455   (no seu PC · NUNCA exposto)
```

O que já está pronto no código: LangGraph e CopilotKit v2 vêm embutidos na Kirana (`/api/copilot`); o site
decide sozinho entre a Kirana online e o atendimento guiado (ver "O que o visitante vê").

---

## 1. Kirana: configurar o `.env`

Edite `Kirana\.env` (o instalador já criou; **mantenha** `KIRANA_GATEWAY_URL` e `KIRANA_GATEWAY_API_KEY`).
Acrescente ou ajuste:

```ini
KIRANA_ENV=production
KIRANA_HOST=127.0.0.1
KIRANA_PORT=3000

# chave das rotas privadas (sessões, memória). Gere uma e guarde:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
KIRANA_ACCESS_TOKEN=COLE_A_CHAVE_GERADA

# atrás do túnel: o IP do visitante vem em X-Forwarded-For (senão o limite por IP vira global)
KIRANA_TRUST_PROXY=true

# quem pode chamar a Kirana pelo navegador (só o site, nunca *):
KIRANA_ALLOWED_ORIGINS=https://daniloxpteam.github.io

# limite de conversas por IP (cada chamada consome o plano do Gateway):
KIRANA_AGENT_RATE_MAX=30

# a ponte do celular (Tamagotchi) fica DESLIGADA nesta etapa:
KIRANA_BRIDGE=off

# o CopilotKit liga telemetria por padrão; desligue:
COPILOTKIT_TELEMETRY_DISABLED=true
```

Depois: `PARAR-TUDO.cmd` e `INICIAR-TUDO.cmd`. O log deve dizer `Kirana v0.5.5 ouvindo em http://127.0.0.1:3000` e
**não** pode haver erro fatal de configuração (em produção ela se recusa a subir sem a chave).

> Em modo produção a interface local (`http://127.0.0.1:3000`) pede a chave de acesso. É o esperado.

Faça o login do Gateway (a sessão do ChatGPT fica só na memória): abra `http://127.0.0.1:1455/auth/start` e conclua.
Confirme:

```powershell
curl.exe -s http://127.0.0.1:3000/api/status
# deve conter  "reachable":true  e  "authenticated":true
```

## 2. Cloudflare Tunnel (expõe só a Kirana, só as rotas necessárias)

No PowerShell:

```powershell
winget install --id Cloudflare.cloudflared -e
cloudflared tunnel login                      # abre o navegador: escolha a zona opportunity.ia.br
cloudflared tunnel create kirana              # anote o ID e o caminho do arquivo .json de credenciais
cloudflared tunnel route dns kirana kirana.opportunity.ia.br
```

Crie `%USERPROFILE%\.cloudflared\config.yml` (troque `<ID>` e `<voce>`):

```yaml
tunnel: kirana
credentials-file: C:\Users\<voce>\.cloudflared\<ID>.json

ingress:
  # LISTA DE PERMITIDOS. Só estas rotas chegam à Kirana; todo o resto responde 404 na borda.
  - hostname: kirana.opportunity.ia.br
    path: ^/(widget/kirana-v2\.js|api/copilot.*|api/status|health)$
    service: http://127.0.0.1:3000
  - service: http_status:404
```

Isso deixa de fora, por desenho, `/api/gateway/*` (a ponte do Gateway), `/api/sessions`, `/api/memory`,
`/api/chat` e a interface. Rode e teste:

```powershell
cloudflared tunnel run kirana        # deixe aberto para testar
```

```powershell
# deve responder 200 (rotas liberadas)
curl.exe -s -o NUL -w "%{http_code}`n" https://kirana.opportunity.ia.br/health
curl.exe -s -o NUL -w "%{http_code}`n" https://kirana.opportunity.ia.br/api/status
# deve responder 404 (rotas que NÃO podem ser públicas)
curl.exe -s -o NUL -w "%{http_code}`n" https://kirana.opportunity.ia.br/api/gateway/health
curl.exe -s -o NUL -w "%{http_code}`n" https://kirana.opportunity.ia.br/api/sessions
curl.exe -s -o NUL -w "%{http_code}`n" https://kirana.opportunity.ia.br/
```

Para iniciar com o Windows (como administrador): `cloudflared service install`. O serviço lê a configuração da
pasta do sistema; se ele não subir, copie `config.yml` e o `.json` para
`C:\Windows\System32\config\systemprofile\.cloudflared\` e ajuste o `credentials-file`.

## 3. Site: apontar para a Kirana

No GitHub do site: **Settings → Secrets and variables → Actions → Variables → New repository variable**

| Nome | Valor |
|---|---|
| `KIRANA_URL` | `https://kirana.opportunity.ia.br` |

(É um endereço público, não um segredo.) Depois, em **Actions → Publicar no GitHub Pages → Re-run all jobs**, ou
faça qualquer commit na `main`. Sem a variável, o site continua no atendimento guiado, como hoje.

Opcionais (também variáveis de build): `NEXT_PUBLIC_KIRANA_DESCANSO` (padrão `00:00-06:00`, fuso de Fortaleza;
vazio desliga) e `NEXT_PUBLIC_KIRANA_SITE_ID` (padrão `opportunity-ai`).

## 4. O que o visitante vê

| Situação | Painel "Atendente digital" |
|---|---|
| Kirana de pé, Gateway com login | Kirana online (com modelo), com rodapé "Falar com a equipe: WhatsApp / formulário" |
| Das 0h às 6h (Fortaleza) | Atendimento guiado, com o aviso "o atendente com IA descansa das 0h às 6h" (nem tenta conectar) |
| PC desligado, túnel fora, Gateway sem login | Atendimento guiado, com o aviso "fora do ar neste momento" |

O visitante nunca fica sem resposta: o guiado responde o essencial e leva ao WhatsApp e ao formulário.

## 5. Rotina

- **Depois de reiniciar o PC ou o Gateway:** `INICIAR-TUDO.cmd` → `http://127.0.0.1:1455/auth/start` (login) →
  `curl.exe -s https://kirana.opportunity.ia.br/api/status` e confira `"authenticated":true`.
  Se o Gateway estiver sem login, o site **já** cai no guiado sozinho.
- **Ao voltar do sono (6h):** o túnel reconecta sozinho. Confira o `authenticated` como acima.
- **Desligar tudo agora:** `PARAR-TUDO.cmd` e `Stop-Service cloudflared` (ou feche o `cloudflared`). O site volta ao guiado.

## 6. Riscos (leia)

- O Gateway é uma via **não oficial** para a sua conta do ChatGPT. A própria documentação dele diz que é local, que
  não deve ser exposto nem atender outras pessoas. Visitantes do site são outras pessoas usando a sua conta:
  existe risco de bloqueio e de violação dos termos do provedor. Use só como teste, com o limite baixo, e não
  confie nisso como serviço contínuo.
- O Gateway **continua só em `127.0.0.1`**; ele nunca é publicado. O que sai para a internet é a Kirana, e só as
  rotas da lista acima.
- Comercial e beta: cada cliente com a API paga dele no `.env` da Kirana dele, nunca a sua conta.

## 7. Tamagotchi (Tama AI)

Fica para depois: usa a **ponte** da Kirana (`/api/gateway/*`) por acesso privado (Tailscale), nunca pelo túnel
público acima (que a bloqueia). Falta a descrição do projeto para decidir o desenho.

## 8. Testes

```bash
# site apontando para uma Kirana de teste (mock) — ver pré-requisitos no topo do arquivo
NEXT_PUBLIC_KIRANA_URL=http://127.0.0.1:3000 npm run build:pages
npm run serve:pages
node testes/kirana-remota.mjs        # online, descanso, fora do ar, Gateway sem login
```
