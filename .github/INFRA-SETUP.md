# Zyra — Setup de Infra & CI

Guia para deixar o CI 100% funcional. Os workflows que dependem de infra que
ainda não existe foram **desativados temporariamente** (movidos para
`.github/disabled-workflows/`, que o GitHub Actions ignora). Assim eles param de
falhar e de mandar e-mail. Conforme você provisiona cada peça, mova o workflow de
volta para `.github/workflows/` e defina os secrets/variáveis correspondentes.

> Repo: `Souza-zxs/Zyra` · Empresa: Horizon LTDA

---

## 1. Estado atual

### ✅ Ativos (rodam sozinhos em runner do GitHub — build/lint/test)
`changed-files`, `ci-blocked-contributors`, `ci-breaking-changes`, `ci-codex-plugin`,
`ci-create-app`, `ci-docs`, `ci-emails`, `ci-front`, `ci-front-component-renderer`,
`ci-new-ui`, `ci-sdk`, `ci-server`, `ci-shared`, `ci-utils`, `ci-website`, `ci-zapier`,
`ci-release-create`, `ci-e2e-main`, `ci-example-app-hello-world`,
`ci-example-app-postcard`, `ci-internal-app-zyra-meeting-bot`, `ci-test-docker-compose`.

> ⚠️ Os últimos 5 (E2E / docker-compose) são pesados e sobem stack completa. Se
> algum ficar instável, mova para `disabled-workflows/` também.

### ⛔ Desativados (esperam infra externa) — em `.github/disabled-workflows/`
| Workflow | Precisa de |
|---|---|
| `i18n-pull`, `i18n-push`, `docs-i18n-pull`, `docs-i18n-push`, `website-i18n-pull`, `website-i18n-push` | **Crowdin** (seção 2) |
| `cd-deploy-main`, `cd-deploy-tag` | **GitHub App** + repo **`zyra-infra`** (seções 3 e 5) |
| `ci-ai-catalog-sync` | **GitHub App** + repo `zyra-infra` |
| `app-prod-parity-e2e-dispatch`, `pr-auto-review-dispatch`, `preview-env-dispatch`, `website-preview-dispatch`, `visual-regression-dispatch`, `post-ci-comments`, `external-contributor-pr-auto-draft` | **GitHub App** + repo **`ci-privileged`** (seções 3 e 4) |
| `claude.yml` | **GitHub App** + `ci-privileged` + secret `CLAUDE_CODE_OAUTH_TOKEN` |
| `ci-internal-apps` | **Imagem Docker** `souza-zxs/zyra-app-dev` (seção 6) |
| `ci-create-app-e2e-minimal` | Auto-contido (verdaccio local) — pode religar cedo; testar antes |

**Como religar qualquer um:** `git mv .github/disabled-workflows/<arquivo> .github/workflows/` e defina os secrets/vars da peça correspondente.

---

## 2. Crowdin (traduções)

Destrava os 6 workflows de i18n. Já deixei os configs (`.github/crowdin-*.yml`) e os
workflows parametrizados — só falta criar a conta e preencher as credenciais.

1. Crie conta em https://crowdin.com (grátis para open source; senão plano pago).
2. Crie **3 projetos**: um para o app, um para docs, um para o website.
   - Idioma fonte: inglês. Adicione os idiomas-alvo desejados.
3. Anote o **Project ID** de cada um (Settings → API).
4. Gere um **Personal Access Token** (Account Settings → API → New Token) com escopo de projetos.
5. Em **Settings → Secrets and variables → Actions** do repo:
   - **Variables:** `CROWDIN_PROJECT_ID_APP`, `CROWDIN_PROJECT_ID_DOCS`, `CROWDIN_PROJECT_ID_WEBSITE`
   - **Secret:** `CROWDIN_PERSONAL_TOKEN`
6. Faça upload inicial das fontes: rode `website-i18n-push` / `i18n-push` / `docs-i18n-push` manualmente (workflow_dispatch) após religá-los.

> Nota: os `base_url` já apontam para `api.crowdin.com` (Crowdin público). Se você
> usar Crowdin Enterprise, troque para `https://<org>.api.crowdin.com`.

---

## 3. GitHub App "dispatcher" (necessário para dispatch/deploy)

Os workflows de dispatch/deploy usam um GitHub App para gerar um token com permissão
de disparar workflows em **outros repos** (`ci-privileged`, `zyra-infra`).

1. Org → **Settings → Developer settings → GitHub Apps → New GitHub App**.
   - Permissions → Repository → **Actions: Read and write**.
   - Onde instalar: só nos repos `ci-privileged` e `zyra-infra`.
2. Instale o App na org e nos 2 repos.
3. Gere uma **private key** (.pem).
4. No repo `Souza-zxs/Zyra` → Actions secrets/variables:
   - **Variable:** `ZYRA_WORKFLOW_DISPATCHER_CLIENT_ID` = client-id do App
   - **Secret:** `ZYRA_WORKFLOW_DISPATCHER_PRIVATE_KEY` = conteúdo do .pem

---

## 4. Repo `Souza-zxs/ci-privileged`

Padrão de segurança: um repo separado que roda ações com secrets, disparado por
`gh workflow run` a partir do CI principal. **Só é necessário se você aceitar PRs de
contribuidores externos** (num repo solo/privado, dá para pular).

Workflows que o CI principal chama nele (você precisa criá-los):
| Workflow alvo | Disparado por |
|---|---|
| `pr-review.yaml` | `pr-auto-review-dispatch` |
| `preview-env.yaml` | `preview-env-dispatch` |
| `website-preview.yaml` | `website-preview-dispatch` |
| `post-breaking-changes-comment.yaml` | `post-ci-comments` |
| `post-visual-regression-comment.yaml` | `visual-regression-dispatch` |
| `convert-pr-to-draft.yaml` | `external-contributor-pr-auto-draft` |
| `post-claude-response.yaml` | `claude.yml` |

> Os originais são privados/internos. Posso gerar versões destes workflows do zero
> quando você criar o repo — é só pedir.

---

## 5. Repo `Souza-zxs/zyra-infra` (deploy)

Pipeline de deploy de verdade. Workflows que o CI chama:
| Workflow alvo | Disparado por | Função |
|---|---|---|
| `auto-deploy-main.yaml` | `cd-deploy-main` | Deploy do main |
| `staging-ci.yaml` | `cd-deploy-tag` (tags `zyra/v*`) | Deploy de tag/staging |
| `automerge-i18n.yaml` | (opcional) | Auto-merge de PRs de tradução |

**Bloqueio:** isso exige decidir ONDE o Zyra roda (servidor próprio, AWS/ECS, k8s…).
Já existe base em `packages/zyra-docker/` (Dockerfile, helm, k8s). Me diga o alvo de
hospedagem que eu monto o pipeline.

---

## 6. Imagens Docker (`souza-zxs/zyra-app-dev`, `souza-zxs/zyra`)

Destrava `ci-internal-apps` e as actions `spawn-*`.

Opções de registry:
- **GHCR (recomendado, grátis, sem conta extra):** publique em `ghcr.io/souza-zxs/zyra`
  usando o `GITHUB_TOKEN`. Troque `souza-zxs/` por `ghcr.io/souza-zxs/` nas actions.
- **Docker Hub:** crie a conta/namespace e um `DOCKERHUB_TOKEN`.

O `Dockerfile` já existe em `packages/zyra-docker/zyra/Dockerfile` (targets `zyra`,
`zyra-server`). Posso criar um workflow `publish-image` (build + push) pronto — é só pedir.

---

## 7. Pendências fora de workflow

- **`yarn.lock` de apps internos** (`packages/zyra-apps/internal/zyra-slack`, `.../zyra-partners`):
  estão travando `twenty-sdk`/`twenty-client-sdk` (stale). O `package.json` já pede
  `zyra-sdk`/`zyra-client-sdk`. Rode `yarn install` nessas pastas para regenerar
  (requer que `zyra-sdk` esteja publicado, ou aponte para o workspace local).
- **Catálogos compilados** `packages/zyra-website/src/locales/generated/*.ts`: editados
  à mão; regenere com `npx nx run zyra-website:lingui:compile` quando possível.
