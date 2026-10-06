# Runbook de demo — sistema de módulos/planos

Status: ETAPA 5 do spec principal. Tarefa original dizia "Starter bloqueado → upgrade → Growth liberado" — nome desatualizado do modelo antigo de tiers (pré-redesenho pra à-la-carte, ver `2026-10-03-saas-plan-tiers-design.md`). Reescrito aqui pro modelo real: **workspace sem módulo → bloqueado → módulo concedido → liberado**.

**Por que isto é um runbook e não um ambiente já rodando**: não há servidor dev acessível nesta sessão (sem banco local válido, ver `reference_vps_native_bindings` na memória do projeto). Isto é o roteiro exato pra rodar a demo real contra um banco de verdade (local com o `setup-dev-env.sh` ou na VPS).

## Pré-requisito

```bash
bash packages/zyra-utils/setup-dev-env.sh
npx nx run zyra-server:database:migrate   # roda os instance commands desta sessão
npx nx start zyra-server
npx nx start asturian-front
```

## Roteiro (workspace sem o módulo `AI_AGENT`)

### 1. Confirmar que o workspace de demo não tem o módulo

```sql
SELECT * FROM core."workspaceModuleGrandfather"
WHERE "workspaceId" = '<DEMO_WORKSPACE_ID>' AND "module" = 'AI_AGENT';
-- deve retornar 0 linhas
```

### 2. Mostrar o bloqueio de verdade (backend, não UI)

No GraphQL Playground (`/playground/graphql`) ou via `curl`, tentar criar um agente de IA:

```graphql
mutation {
  createWhatsappAgent(input: { whatsappChannelId: "<ID>", name: "Demo", systemPrompt: "..." , greetingMessage: null }) {
    id
  }
}
```

Resposta esperada: erro `ForbiddenException` — `This feature requires the "AI_AGENT" module to be contracted.` (vem de `WorkspacePlanTierGuard`, backend, sem passar pela UI — prova a propriedade "bypass via API" da ETAPA 4: não existe um caminho que pule essa checagem).

Na UI (`/settings/accounts`), o card de WhatsApp AI Agent mostra o `Pill` "Bloqueado" na página `/settings/billing/modules` (`SettingsPlanModules`, construída nesta sessão).

### 3. "Upgrade" — conceder o módulo

Mais simples pra demo: inserir a linha de grandfather diretamente (equivalente a uma contratação via Stripe real, que ainda não existe — ver spec principal, seção "fora de escopo").

```sql
INSERT INTO core."workspaceModuleGrandfather" ("workspaceId", "module", "reason")
VALUES ('<DEMO_WORKSPACE_ID>', 'AI_AGENT', 'demo');
```

Ou, programaticamente (mesmo efeito, reutilizável em um script de seed):

```ts
await workspacePlanTierService.grantModuleIfMissing(
  demoWorkspaceId,
  PlanGatedFeature.AI_AGENT,
  'demo',
);
```

### 4. Mostrar liberado

Repetir a mutation do passo 2 — agora deve criar o agente normalmente. Na página `/settings/billing/modules`, o card vira "Ativo" (`Pill` verde + `IconCheck`), e `/settings/billing/modules` também mostra o uso real (`workspacePlanUsage`) contra o limite incluso no módulo (`maxAIAgents: 1`, `maxAIMessagesMonthly: 1000` — `module-catalog.constant.ts`).

### 5. (Opcional) Mostrar o limite numérico também

Repetir o passo 3-4 do zero pra `maxCustomObjects`, criando um segundo objeto customizado além do incluído no módulo `CUSTOM_OBJECTS` (5 por padrão) — a 6ª criação deve falhar com `PlanLimitExceededException`, mensagem `Plan limit reached for "maxCustomObjects": 5/5...`.

### Resetar entre demos

```sql
DELETE FROM core."workspaceModuleGrandfather"
WHERE "workspaceId" = '<DEMO_WORKSPACE_ID>' AND "module" = 'AI_AGENT';
```

(Não há endpoint de "revoke" — só grandfather/grant existe hoje, condizente com o modelo real: módulos normalmente só crescem via Stripe, nunca são removidos por um usuário da aplicação.)

## O que esta demo prova, mapeado pra ETAPA 4

| Propriedade pedida | Como o passo acima prova |
|---|---|
| Isolamento entre planos | Passo 1 — outro workspace nunca tem a linha, nunca é afetado |
| Limites | Passo 5 |
| Multi-tenancy | Passo 1 (filtro por `workspaceId` em toda query) — também coberto por teste automatizado em `plan-tier-isolation-and-bypass.spec.ts` |
| Bypass via API | Passo 2 — chamada direta ao GraphQL, sem UI, ainda bloqueada |
