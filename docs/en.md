<!-- Languages: [English](./en.md) · [Português](./pt-BR.md) · [Español](./es.md) · [Français](./fr.md) · [Deutsch](./de.md) · [Italiano](./it.md) -->

# [Nome do Cliente] — How it works

> **Proprietary software.** © 2026 [Empresa Cliente]. All rights reserved. This is **not** open-source software. See [`../LICENSE`](../LICENSE).

## What [Nome do Cliente] is

[Nome do Cliente] is a complete **CRM** (contacts, companies, opportunities, activities, emails and dashboards), owned by **[Empresa Cliente]**. It is **metadata-driven**: objects, fields and views are defined as data, so the CRM can be adapted without a new deployment.

## How it works

[Nome do Cliente] is an **Nx monorepo** with three runtime pieces talking over **GraphQL**:

```
Browser ──HTTP/GraphQL──► Server (NestJS, :3000)
  ▲ React + Vite               │
  Front (:3001)                ├─ PostgreSQL :5432  (core / metadata / per-workspace schemas)
                               └─ Redis :6379  ◄── Worker (BullMQ background jobs)
```

- **Front** (`asturian-front`): React app bundled with **Vite** — the user interface.
- **Server** (`zyra-server`): **NestJS** API with **GraphQL**, **TypeORM** and an engine that **generates the GraphQL schema dynamically per workspace** from the metadata tables.
- **Worker**: same server code, consuming **BullMQ** queues on Redis for background jobs.
- **Database**: **PostgreSQL**, multi-tenant — a `core` schema, a `metadata` schema (the blueprint), and one schema **per workspace** with the real tables.
- **Cache/queues**: **Redis**.

> Package names above (`asturian-front`, `zyra-server`, ...) are internal technical identifiers, not the product brand.

## How to run it locally (Windows)

[Nome do Cliente] runs with **npm + Vite**. Only PostgreSQL and Redis run in **Docker**; everything else is plain npm.

```powershell
# First time
npm install
npm run services:up    # PostgreSQL + Redis (Docker)
npm run db:init        # initialize the database

# Every day
npm run dev            # server :3000, front (Vite) :3001, worker
```

PowerShell shortcuts: `./zyra.ps1 -Setup` (first time) and `./zyra.ps1` (run).

Then open **http://localhost:3001** and sign in with **"Continue with Email"** (pre-filled credentials).

| Service | Port |
|---|---|
| Front (Vite) | 3001 |
| Server (API/GraphQL) | 3000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

Full Windows guide: [`../WINDOWS.md`](../WINDOWS.md).

## Ownership

[Nome do Cliente] is a **private, proprietary product of [Empresa Cliente]**. The rights were acquired from the original creators. The repository is confidential; no open-source license applies.
