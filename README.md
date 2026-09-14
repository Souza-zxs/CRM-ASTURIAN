<p align="center">
  <img src="./packages/zyra-website/public/images/core/logo.svg" width="100px" alt="Logo da Zyra" />
</p>

<h2 align="center">Zyra — CRM da Horizon LTDA</h2>

<p align="center"><strong>Software proprietário e privado.</strong> © 2026 Horizon LTDA. Todos os direitos reservados.</p>

<br />

# Sobre

A **Zyra** é um CRM completo (contatos, empresas, oportunidades, atividades, e-mails e dashboards), construído como **monorepo Nx** e orientado a metadados — objetos, campos e views são definidos como dados, o que permite adaptar o CRM sem novo deploy.

> [!IMPORTANT]
> Este é um produto **proprietário da Horizon LTDA**. O repositório é **privado e confidencial**. Os direitos foram adquiridos dos criadores originais. Consulte o arquivo [`LICENSE`](./LICENSE).

<br />

# Como rodar (Windows)

A Zyra roda localmente com **npm + Vite**. Apenas Postgres e Redis sobem em **Docker**; todo o resto é npm puro.

```powershell
# Primeira vez
npm install
npm run services:up    # Postgres + Redis (Docker)
npm run db:init        # inicializa o banco

# Dia a dia
npm run dev            # server :3000, front (Vite) :3001, worker
```

Atalhos em PowerShell: `./zyra.ps1 -Setup` (primeira vez) e `./zyra.ps1` (rodar).

Depois abra **http://localhost:3001**. O guia completo está em **[WINDOWS.md](./WINDOWS.md)**.

| Serviço | Porta |
|---|---|
| Front (Vite) | 3001 |
| Server (API/GraphQL) | 3000 |
| Postgres | 5432 |
| Redis | 6379 |

<br />

# Stack

- **TypeScript** + **Nx** (monorepo, gerenciado com **npm workspaces**)
- **NestJS** (back), com **BullMQ**, **PostgreSQL** e **Redis**
- **React** (front), com **Jotai**, **Linaria** e **Lingui**, empacotado com **Vite**

<br />

# Estrutura

```
packages/
├── zyra-front/     # aplicação React (front)
├── zyra-server/    # API NestJS (back + worker)
├── zyra-ui/        # biblioteca de componentes
├── zyra-shared/    # tipos e utilitários comuns
├── zyra-emails/    # templates de e-mail
└── ...             # cli, sdk, website, docs e demais pacotes
```

Documentação técnica de desenvolvimento: [`CLAUDE.md`](./CLAUDE.md) ·
Contexto de produto e marca: [`PRODUCT.md`](./PRODUCT.md) ·
Sistema de design: [`DESIGN.md`](./DESIGN.md)

<br />

---

<p align="center">Zyra é uma marca e um produto da <strong>Horizon LTDA</strong>. Uso interno autorizado apenas.</p>
