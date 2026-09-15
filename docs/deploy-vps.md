# Deploy em uma VPS compartilhada

Este documento descreve como publicar o backend do [Nome do Cliente] (server + worker) em uma
VPS própria via Docker Compose, usando bancos gerenciados externos (Postgres e
Redis) em vez de subir esses serviços na própria VPS — o mesmo modelo hoje usado
no Railway (`.railway/railway.ts`), só que rodando em container próprio.

O front-end (`packages/zyra-front`) **não** é servido por este Compose — ele é
publicado separadamente (ex.: Vercel, via `scripts/vercel-build-front.sh`, que já
aplica a marca whitelabel automaticamente). Este guia cobre só o backend.

## 1. Pré-requisitos na VPS

- Docker + Docker Compose Plugin instalados (`docker compose version`).
- Um banco Postgres acessível pela internet (ex.: Supabase) e uma URL de conexão.
- Um Redis acessível pela internet (ex.: Upstash) e sua URL.
- O domínio/porta que vai apontar para o container `server` (porta interna 3000,
  publicada em `127.0.0.1:3002` — coloque um proxy reverso, ex. Nginx/Caddy, na
  frente para TLS e para expor publicamente).

## 2. Clonar o repositório e configurar o `.env.production`

```bash
git clone <repo> zyra && cd zyra
cp packages/zyra-server/.env.example packages/zyra-server/.env.production
```

Edite `packages/zyra-server/.env.production` com os valores de produção. No
mínimo:

```bash
NODE_ENV=production
PG_DATABASE_URL=postgres://usuario:senha@host:5432/banco
# Se o Postgres gerenciado exigir SSL (ex.: Supabase):
# PG_SSL_CA_PATH=./certs/supabase-ca.pem
REDIS_URL=redis://usuario:senha@host:6379
APP_SECRET=<string aleatória longa e única>
FRONTEND_URL=https://app.seudominio.com
SERVER_URL=https://api.seudominio.com
SIGN_IN_PREFILLED=false
```

Não defina aqui `EMAIL_FROM_NAME`, `ZYRA_PRODUCT_NAME`, `ZYRA_LOGO_URL` etc. —
esses vêm da marca whitelabel selecionada no passo 3 (`.env.brand`, carregado
**antes** de `.env`/`.env.production` em `environment.module.ts`, então a marca
sempre tem prioridade nesses campos específicos).

## 3. Escolher a marca whitelabel

Cada marca vive em `brands/<slug>/brand.config.json` (veja `brands/README.md`).
Para criar uma nova marca sem editar JSON na mão:

```bash
npx nx build zyra-shared
node scripts/create-brand.mjs
```

Para publicar com uma marca específica, exporte `ZYRA_BRAND` com o slug da marca
antes do build — ele é passado como build arg do Dockerfile e fica embutido na
imagem (gera `packages/zyra-server/.env.brand` dentro do container). Sem
`ZYRA_BRAND`, o padrão é `zyra` (identidade original do fork, sem efeito).
Para publicar com a marca deste cliente, use `ZYRA_BRAND=cliente` (veja
`brands/cliente/brand.config.json` e `brands/README.md`).

## 4. Subir os containers

Da raiz do repositório:

```bash
ZYRA_BRAND=<slug-da-marca> docker compose -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

Isso builda e sobe dois serviços:

- `server` — API + GraphQL + migrações + cron jobs, expõe `127.0.0.1:3002`.
- `worker` — processa filas em background (BullMQ), sem migrações/cron próprios
  (`DISABLE_DB_MIGRATIONS`/`DISABLE_CRON_JOBS_REGISTRATION`, para não competir
  com o `server`).

O `healthcheck` do `server` dá até 300s antes de cobrar saúde — o primeiro boot
constrói um schema GraphQL grande e pode demorar.

Acompanhar os logs:

```bash
docker compose -f packages/zyra-docker/docker-compose.prod.yml logs -f
```

## 5. Trocar de marca depois

Rodar o comando do passo 4 de novo com outro `ZYRA_BRAND` reconstrói a imagem
com a nova identidade — não precisa recriar o `.env.production` (só os campos
de marca mudam, via `.env.brand`).

## 6. Várias marcas na mesma VPS (opcional)

Este Compose sobe uma instância por vez sob o nome de projeto `zyra` (linha
`name: zyra` no arquivo). Para rodar mais de uma marca simultaneamente na
mesma VPS (cada uma em portas/domínios diferentes), duplique o arquivo de
env (`.env.production.<slug>`) e suba cada marca com um nome de projeto e uma
porta de host diferentes, por exemplo:

```bash
ZYRA_BRAND=acme-test docker compose -p zyra-acme-test \
  -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

(ajuste a porta publicada do `server` em uma cópia do compose file para não
colidir com `127.0.0.1:3002` de outra marca já rodando).

## Referências

- `brands/README.md` — como funciona o sistema de marca.
- `scripts/select-brand.mjs` / `scripts/create-brand.mjs` — a mecânica por trás.
- `.railway/railway.ts` — o mesmo backend, via Railway em vez de uma VPS própria.
- `packages/zyra-server/.env.example` — lista completa de variáveis suportadas.
