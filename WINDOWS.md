# Rodando o [Nome do Cliente] localmente no Windows (npm + Vite)

Este guia descreve como rodar o [Nome do Cliente] em um Windows do zero, usando **npm** e **Vite**.
Postgres e Redis rodam via **Docker** (única dependência de infraestrutura); todo o resto é npm/Node.

## Pré-requisitos

| Ferramenta | Versão | Observação |
|------------|--------|------------|
| Node.js | `^24.5.0` | use a versão do `.nvmrc` |
| npm | `>=10` | já vem com o Node 24 |
| Docker Desktop | atual | só para Postgres + Redis |
| Git | atual | inclui o Git Bash, usado por alguns scripts |

> Postgres/Redis nativos no Windows dão muito trabalho — por isso usamos Docker **apenas** para esses dois serviços. A aplicação (front, server, worker) roda em npm puro.

## Primeira vez (setup)

No PowerShell, na raiz do projeto:

```powershell
# 1. Instala todas as dependências do monorepo (npm workspaces)
npm install

# 2. Sobe Postgres + Redis em containers
npm run services:up

# 3. Inicializa o banco (schema + dados base) — só na primeira vez
npm run db:init
```

Ou use o atalho que faz tudo isso de uma vez:

```powershell
./zyra.ps1 -Setup
```

## Dia a dia (rodar)

```powershell
npm run dev
```

Isso sobe, em paralelo:
- **server** (NestJS) em `http://localhost:3000`
- **front** (Vite) em `http://localhost:3001`
- **worker** (BullMQ) para jobs em background

Garante também que Postgres + Redis estejam de pé (`services:up`).

Abra **http://localhost:3001**. Na tela de login, clique em **"Continue with Email"** e use as credenciais pré-preenchidas.

Atalho equivalente:

```powershell
./zyra.ps1
```

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Sobe serviços + front + server + worker |
| `npm run services:up` | Sobe só Postgres + Redis |
| `npm run services:down` | Para os containers |
| `npm run services:reset` | Para e **apaga** os dados do banco |
| `npm run db:init` | Inicializa o schema do banco |
| `npx nx start zyra-server` | Só o backend |
| `cd packages/zyra-front; npx vite --port 3001` | Só o frontend |

## Portas

| Serviço | Porta |
|---------|-------|
| Front (Vite) | 3001 |
| Server (API/GraphQL) | 3000 |
| Postgres | 5432 |
| Redis | 6379 |

## Configuração

As variáveis de ambiente já vêm prontas em:
- `packages/zyra-server/.env`
- `packages/zyra-front/.env`

Os valores padrão já apontam para o Postgres/Redis do Docker (`localhost:5432` / `localhost:6379`).

## Problemas comuns

- **`npm install` falha com conflito de peer dependency**: o projeto já inclui um `.npmrc` com `legacy-peer-deps=true`. Garanta que está rodando o `npm install` na raiz.
- **Erro de conexão com o banco**: confirme que o Docker Desktop está aberto e rode `npm run services:up`. Cheque com `docker ps`.
- **Porta ocupada (3000/3001/5432/6379)**: pare o processo que está usando a porta ou ajuste no `.env` correspondente.
- **Patches não aplicados**: o `postinstall` roda `patch-package` automaticamente. Se vir avisos, rode `npx patch-package` na raiz.
- **Front: `504 (Outdated Optimize Dep)` no navegador**: o cache de pré-bundle do Vite ficou velho. Pare o dev, rode `rm -rf node_modules/.vite` (ou apague a pasta) e suba de novo com `npm run dev`; depois **recarregue o navegador com Ctrl+Shift+R**.
- **Front abre mas fica "conectando"**: confira que o **server (:3000)** subiu (`Nest application successfully started` no log). O front (:3001) sobe antes do server.

## Hot-reload

- **Front (Vite)**: hot-reload automático — salvou, recarrega.
- **Server (NestJS)**: `npm run dev` roda o server com `nest start` (estável no Windows), **sem** hot-reload. Para aplicar mudanças no backend, reinicie o `npm run dev`.
- Se quiser hot-reload no backend, use `npm run dev:watch` (usa `nest start --watch`) — porém no Windows ele às vezes é instável (corrida de compilação a frio / `treeKill`). Prefira `npm run dev` para estabilidade.
