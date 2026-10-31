# Kirana online no site da Opportunity — passo a passo (Windows)

**Escopo.** A Kirana da Opportunity atende **o site da Opportunity** (GitHub Pages) a partir do **seu PC**,
usando o **seu Gateway**. É uso pessoal e de teste: não é o kit de produção para clientes, não atende outros
sites e não faz pedido nem WhatsApp.

```
visitante → https://daniloxpteam.github.io/opportunity-site        (site estático, continua no GitHub Pages)
               │  carrega o widget e conversa com a Kirana
               ▼
          https://kirana.opportunity.ia.br        (Cloudflare Tunnel: só 4 rotas liberadas)
               ▼
          Kirana  127.0.0.1:3000                  (no seu PC)
               ▼
          Gateway 127.0.0.1:1455                  (no seu PC · NUNCA exposto)
```

**Ponto de partida (já confirmado):** Kirana 0.5.5 e Gateway funcionando e autorizados no seu PC, com o modelo
`gpt-6-luna`. Falta só tornar a Kirana alcançável pelo site, com segurança.

**Quem faz o quê.** Eu não alcanço o seu PC. Por isso, o que dá para automatizar está no script
`scripts/kirana-online.mjs` (anexo a esta entrega): ele ajusta o `.env`, escreve o `config.yml` do túnel e testa
tudo. Os passos que pedem a sua conta (login no Cloudflare) ficam com você.

---

## Passo 1 — Colocar a Kirana em modo online (o script faz)

1. Copie `kirana-online.mjs` para dentro da pasta da Kirana (onde está o `INICIAR-TUDO.cmd`).
2. Abra o PowerShell **nessa pasta** e rode:

```powershell
node kirana-online.mjs env
```

O que ele faz no `.env` (antes, guarda uma cópia `.env.antes-online-…`, que o `.gitignore` da Kirana já ignora):

| Chave | Valor |
|---|---|
| `KIRANA_ENV` | `production` (rotas privadas passam a exigir chave) |
| `KIRANA_HOST` / `KIRANA_PORT` | `127.0.0.1` / `3000` (continua só no seu PC) |
| `KIRANA_ACCESS_TOKEN` | gera uma chave forte **se ainda não houver** (mantém a que já existir) |
| `KIRANA_TRUST_PROXY` | `true` (atrás do túnel, o limite vale por visitante, não global) |
| `KIRANA_ALLOWED_ORIGINS` | acrescenta `https://daniloxpteam.github.io` (mantém as que já havia) |
| `KIRANA_AGENT_RATE_MAX` | `30` por minuto por IP (se já houver um valor diferente de 0, mantém) |
| `KIRANA_BRIDGE` | `off` (a ponte do celular fica desligada nesta etapa) |
| `COPILOTKIT_TELEMETRY_DISABLED` | `true` |

**Não toca** em `KIRANA_GATEWAY_URL` nem `KIRANA_GATEWAY_API_KEY`.

3. Reinicie: `PARAR-TUDO.cmd` e depois `INICIAR-TUDO.cmd`.
4. Se o Gateway foi reiniciado, faça o login de novo (a sessão fica só na memória): abra
   `http://127.0.0.1:1455/auth/start` e conclua.

> **O que muda para você:** em modo online a tela local da Kirana (`http://127.0.0.1:3000`) passa a pedir a
> chave de acesso. Ela está no `.env`, na linha `KIRANA_ACCESS_TOKEN`. Não a envie a ninguém nem a coloque no GitHub.

Confira:

```powershell
node kirana-online.mjs testar --url http://127.0.0.1:3000
```

Localmente, 3 itens da parte "Túnel público" aparecem como falha (`/api/sessions`, `/api/memory` e `/` dão 401/200
em vez de 404). É esperado: quem devolve 404 é o túnel, que ainda não existe. Todo o resto deve estar OK
(Kirana responde, Gateway alcançável e com login, CORS libera o site e não libera outros).

## Passo 2 — Cloudflare Tunnel (você faz o login; o script escreve a configuração)

O domínio `opportunity.ia.br` precisa estar na sua conta Cloudflare (você disse que está).

```powershell
winget install --id Cloudflare.cloudflared -e
cloudflared tunnel login
cloudflared tunnel create kirana
cloudflared tunnel route dns kirana kirana.opportunity.ia.br
```

- `tunnel login` abre o navegador: escolha a zona `opportunity.ia.br`.
- Feche e abra o PowerShell depois do `winget` se o comando `cloudflared` não for reconhecido.
- `route dns` cria o registro `kirana` no seu DNS apontando para o túnel.

Agora gere a configuração (na pasta da Kirana):

```powershell
node kirana-online.mjs tunel
```

Ele acha as credenciais em `%USERPROFILE%\.cloudflared`, grava o `config.yml` e **só libera estas rotas**:

```
/widget/kirana-v2.js     /api/copilot…     /api/status     /health
```

Todo o resto (`/api/gateway/*`, `/api/sessions`, `/api/memory`, `/api/chat`, a interface) responde 404 na borda,
sem chegar à Kirana. Se houver mais de um túnel na pasta, use `--id <ID>`.

Suba o túnel (deixe a janela aberta) e, em **outro** PowerShell, teste:

```powershell
cloudflared tunnel run kirana
```

```powershell
node kirana-online.mjs testar
```

Tudo deve sair OK, incluindo as rotas bloqueadas dando 404. Se algo falhar, a mensagem diz o que corrigir.

## Passo 3 — Site apontando para a Kirana (já está no código)

O site passa a usar `https://kirana.opportunity.ia.br` por padrão (no workflow do Pages). Não precisa criar
variável no GitHub. Depois que o PR for mesclado e o Pages publicar, o painel "Atendente digital" abre a Kirana
online sempre que ela estiver de pé, e o atendimento guiado nos demais casos.

Opcional, se um dia quiser trocar ou desligar: **Settings → Secrets and variables → Actions → Variables** →
`KIRANA_URL` (o valor da variável vence o padrão). Também existem `NEXT_PUBLIC_KIRANA_DESCANSO` (padrão
`00:00-06:00`, fuso de Fortaleza; vazio desliga) e `NEXT_PUBLIC_KIRANA_SITE_ID` (padrão `opportunity-ai`).

## O que o visitante vê

| Situação | Painel "Atendente digital" |
|---|---|
| Kirana de pé e Gateway com login | Kirana online (com modelo), com rodapé "Falar com a equipe: WhatsApp / formulário" |
| Das 0h às 6h (Fortaleza) | Atendimento guiado, com aviso de que o atendente com IA descansa (nem tenta conectar) |
| PC desligado, túnel fora ou Gateway sem login | Atendimento guiado, com aviso de "fora do ar neste momento" |

O visitante nunca fica sem resposta: o guiado responde o essencial e leva ao WhatsApp e ao formulário.

## Rotina

- **Depois de reiniciar o PC ou o Gateway:** `INICIAR-TUDO.cmd` → `http://127.0.0.1:1455/auth/start` (login) →
  `node kirana-online.mjs testar`. Sem login no Gateway, o site **já** cai sozinho no guiado.
- **Subir o túnel junto com o Windows** (PowerShell como administrador): `cloudflared service install`. O serviço lê
  a configuração da pasta do sistema; se não subir, copie `config.yml` e o `.json` para
  `C:\Windows\System32\config\systemprofile\.cloudflared\` e ajuste o `credentials-file`.
- **Desligar agora:** `PARAR-TUDO.cmd` e feche o `cloudflared` (ou `Stop-Service cloudflared`). O site volta ao guiado.

## Riscos (leia)

- O Gateway é uma via **não oficial** para a sua conta do ChatGPT. A documentação dele diz que é local, que não
  deve ser exposto nem atender outras pessoas. Visitantes do site são outras pessoas usando a sua conta: há risco de
  bloqueio e de violação dos termos do provedor. Use como teste, com o limite baixo, e não trate como serviço contínuo.
- O Gateway **continua só em `127.0.0.1`**; nunca é publicado. Sai para a internet apenas a Kirana, e só as rotas da lista.
- Para clientes: cada um com a API paga dele no `.env` da Kirana dele, nunca a sua conta.

## Tama IA (depois)

O Tama usa o **mesmo Gateway**, mas por outro caminho: a **ponte** da Kirana (`/api/gateway/*`), por acesso
**privado** (Tailscale), nunca pelo túnel público acima (que a bloqueia). O `.env` já deixa a ponte desligada
(`KIRANA_BRIDGE=off`); ligá-la exige token próprio e `KIRANA_BRIDGE_REQUIRE_HTTPS`/`KIRANA_BRIDGE_TRUST_PROXY`
(ver `.env.example` da Kirana e `windows\Preparar-AcessoRemoto.ps1`). Antes disso faltam as decisões do parecer
(uso privado, divisão do login do Gateway entre site e Tama, quem acessa). Quando chegar a hora, fazemos como
este passo a passo.

## Testes do site (para quem desenvolve)

```bash
# site apontando para uma Kirana de teste (mock) — ver pré-requisitos no topo do arquivo
NEXT_PUBLIC_KIRANA_URL=http://127.0.0.1:3000 npm run build:pages
npm run serve:pages
node testes/kirana-remota.mjs        # online, descanso, fora do ar, Gateway sem login
```
