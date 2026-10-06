# Despliegue en una VPS compartida

Este documento describe cómo publicar el backend de [Nombre del Cliente] (server + worker) en una
VPS propia vía Docker Compose, usando bases de datos administradas externas (Postgres y
Redis) en lugar de levantar esos servicios en la propia VPS — el mismo modelo que se usa hoy
en Railway (`.railway/railway.ts`), solo que corriendo en un contenedor propio.

El front-end (`packages/asturian-front`) **no** es servido por este Compose — se
publica por separado (ej.: Vercel, vía `scripts/vercel-build-front.sh`, que ya
aplica la marca whitelabel automáticamente). Esta guía cubre solo el backend.

## 1. Requisitos previos en la VPS

- Docker + Docker Compose Plugin instalados (`docker compose version`).
- Una base de datos Postgres accesible por internet (ej.: Supabase) y una URL de conexión.
- Un Redis accesible por internet (ej.: Upstash) y su URL.
- El dominio/puerto que apuntará al contenedor `server` (puerto interno 3000,
  publicado en `127.0.0.1:3002` — coloque un proxy inverso, ej. Nginx/Caddy, al
  frente para TLS y para exponerlo públicamente).

## 2. Clonar el repositorio y configurar el `.env.production`

```bash
git clone <repo> zyra && cd zyra
cp packages/zyra-server/.env.example packages/zyra-server/.env.production
```

Edite `packages/zyra-server/.env.production` con los valores de producción. Como
mínimo:

```bash
NODE_ENV=production
PG_DATABASE_URL=postgres://usuario:senha@host:5432/banco
# Si el Postgres administrado requiere SSL (ej.: Supabase):
# PG_SSL_CA_PATH=./certs/supabase-ca.pem
REDIS_URL=redis://usuario:senha@host:6379
APP_SECRET=<cadena aleatoria larga y única>
FRONTEND_URL=https://app.seudominio.com
SERVER_URL=https://api.seudominio.com
SIGN_IN_PREFILLED=false
```

No defina aquí `EMAIL_FROM_NAME`, `ZYRA_PRODUCT_NAME`, `ZYRA_LOGO_URL`, etc. —
esos valores vienen de la marca whitelabel seleccionada en el paso 3 (`.env.brand`, cargado
**antes** de `.env`/`.env.production` en `environment.module.ts`, por lo que la marca
siempre tiene prioridad en esos campos específicos).

## 3. Elegir la marca whitelabel

Cada marca vive en `brands/<slug>/brand.config.json` (vea `brands/README.md`).
Para crear una nueva marca sin editar JSON a mano:

```bash
npx nx build zyra-shared
node scripts/create-brand.mjs
```

Para publicar con una marca específica, exporte `ZYRA_BRAND` con el slug de la marca
antes del build — se pasa como build arg del Dockerfile y queda embebido en
la imagen (genera `packages/zyra-server/.env.brand` dentro del contenedor). Sin
`ZYRA_BRAND`, el valor por defecto es `zyra` (identidad original del fork, sin efecto).
Para publicar con la marca de este cliente, use `ZYRA_BRAND=cliente` (vea
`brands/cliente/brand.config.json` y `brands/README.md`).

## 4. Levantar los contenedores

Desde la raíz del repositorio:

```bash
ZYRA_BRAND=<slug-da-marca> docker compose -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

Esto construye y levanta dos servicios:

- `server` — API + GraphQL + migraciones + cron jobs, expone `127.0.0.1:3002`.
- `worker` — procesa colas en segundo plano (BullMQ), sin migraciones/cron propios
  (`DISABLE_DB_MIGRATIONS`/`DISABLE_CRON_JOBS_REGISTRATION`, para no competir
  con el `server`).

El `healthcheck` del `server` da hasta 300s antes de verificar el estado de salud — el primer arranque
construye un esquema GraphQL grande y puede demorar.

Para seguir los logs:

```bash
docker compose -f packages/zyra-docker/docker-compose.prod.yml logs -f
```

## 5. Cambiar de marca después

Ejecutar de nuevo el comando del paso 4 con otro `ZYRA_BRAND` reconstruye la imagen
con la nueva identidad — no es necesario recrear el `.env.production` (solo cambian los campos
de marca, vía `.env.brand`).

## 6. Varias marcas en la misma VPS (opcional)

Este Compose levanta una instancia a la vez bajo el nombre de proyecto `zyra` (línea
`name: zyra` en el archivo). Para correr más de una marca simultáneamente en
la misma VPS (cada una en puertos/dominios diferentes), duplique el archivo de
env (`.env.production.<slug>`) y levante cada marca con un nombre de proyecto y un
puerto de host diferentes, por ejemplo:

```bash
ZYRA_BRAND=acme-test docker compose -p zyra-acme-test \
  -f packages/zyra-docker/docker-compose.prod.yml up -d --build
```

(ajuste el puerto publicado del `server` en una copia del archivo compose para no
colisionar con `127.0.0.1:3002` de otra marca que ya esté corriendo).

## Referencias

- `brands/README.md` — cómo funciona el sistema de marca.
- `scripts/select-brand.mjs` / `scripts/create-brand.mjs` — la mecánica detrás de esto.
- `.railway/railway.ts` — el mismo backend, vía Railway en lugar de una VPS propia.
- `packages/zyra-server/.env.example` — lista completa de variables soportadas.
