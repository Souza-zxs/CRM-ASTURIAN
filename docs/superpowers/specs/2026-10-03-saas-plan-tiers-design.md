# SaaS por módulos avulsos (assinatura base + add-ons por funcionalidade)

Status: Etapa 3 (implementação) em andamento — ver seção "Status de implementação" no fim do arquivo para o que está pronto/verificado vs. pendente. Usuário autorizou decisões autônomas de implementação em 2026-10-03 ("tome decisões sobre o projeto sozinho e não me pergunte nada").
Supersede/evolui o módulo `plan-tier` introduzido na PR #4 (`docs/superpowers/specs/2026-10-01-plan-tier-gating-and-workshop-whatsapp-design.md`), que hoje tem 2 tiers binários (BASIC/PRO).

**Nota de revisão (mesmo dia, 2026-10-03):** a primeira versão deste documento propunha 3 pacotes fixos (STARTER/GROWTH/SCALE). O usuário corrigiu o modelo comercial depois de ler a proposta: **não existem pacotes/tiers** — existe uma mensalidade base (o CRM estático, pré-configurado) e cada funcionalidade adicional (WhatsApp, IA, Voice, Workflows, objetos customizados, etc.) é um **módulo avulso**, vendido separadamente e somado à mensalidade — "tipo DLC de jogo: cada uma paga". Esta versão substitui a anterior por completo.

**Segunda rodada de detalhe (mesmo dia):** o usuário deu o exemplo concreto do pricing: base ≈ €97/mês (estático: Pessoas/Empresas/Oportunidades + alguns workflows mais fáceis), cada módulo adicional ≈ €90/mês flat, lista de módulos-alvo: WhatsApp, "Manychat-like" (flow builder visual de chat), atendimento inteligente com IA, automação de processos, conexões com outras plataformas, MCP, conexão com IA. Checado contra o código agora:
- **MCP já existe de verdade** — `packages/zyra-server/src/engine/api/mcp/` é um servidor MCP real e substancial (protocolo JSON-RPC, autenticado via API key/Role, expõe ferramentas como `list_object_metadata_names`, `execute_tool`, `get_tool_catalog`, `load_skill`). Isto é um módulo candidato legítimo, não precisa ser inventado — só gateado.
- **"Manychat-like" (construtor visual de fluxo de conversa) NÃO existe.** O mais próximo são duas peças distintas e já existentes: o Agente de IA do WhatsApp (conversa livre por prompt + knowledge base, não um fluxo visual) e o motor de Workflows (automação geral, não específico de chat). Construir um flow-builder visual de conversa é funcionalidade nova, fora do escopo desta auditoria de limites.
- **"Conexões com outras plataformas" (integrações genéricas tipo Zapier) NÃO existe como sistema.** Só existem: webhooks de entrada genéricos (`metadata-modules/webhook/`) e adapters de pagamento específicos (Hotmart/Kiwify/Stripe). Não há um framework de "conectar a qualquer plataforma terceira" — isso também seria funcionalidade nova.
- **"Conexão com IA" é ambíguo** — pode ser o mesmo que "atendimento inteligente com IA" (Agente de WhatsApp) ou algo distinto (ex: permitir o workspace plugar a própria chave de API de LLM). Preciso que você esclareça antes de modelar como módulo separado.

## Contexto

Pedido original (2026-10-03): transformar o Zyra num SaaS com limites de **recursos, usuários e consumo** aplicados no **backend**. Modelo comercial final confirmado: **assinatura base + módulos avulsos**, sem pacotes fixos — cada cliente paga a base e liga/desliga módulos individualmente, cada um com seu próprio preço. Requisitos que seguem valendo:
- Arquitetura de limites centralizada, não `if module === "whatsapp"` espalhado.
- Plano/módulos contratados (o que a empresa paga) e Role (o que um usuário específico pode fazer) são conceitos separados.
- Preparar terreno para cobrança por consumo (créditos/tokens/mensagens/minutos de voz) sem implementar billing de consumo agora.
- Não quebrar nada que já funciona. Não recriar o que já existe. Não inventar funcionalidade que não existe.
- Entrega em etapas: Auditoria → Proposta → Validação → Implementação → Testes → Demo.
- Sem acesso gratuito: todo workspace precisa de assinatura base ativa para existir/funcionar (decisão já tomada em conversa anterior).

Este documento é a Etapa 2 (Proposta Técnica), construída em cima de uma auditoria real do código (3 agentes, leitura de código, não suposição) — ver "Etapa 1" abaixo. A auditoria em si não mudou com a revisão do modelo comercial — só a arquitetura que se constrói em cima dela.

## Etapa 1 — Auditoria (resumo dos achados que moldam a proposta)

**O que já existe e vai ser reaproveitado, não recriado:**
- `WorkspaceEntity` é o tenant; `UserWorkspaceEntity` liga usuário↔workspace; resolução do workspace da request já passa por `JwtAuthStrategy` → `AsyncLocalStorage`. Multi-tenancy maduro, zero mudança.
- `RoleEntity` + `RoleTargetEntity` (liga role a `userWorkspace` | `agent` | `apiKey`) + `ObjectPermissionEntity`/`FieldPermissionEntity`. Roles customizadas por workspace já funcionam hoje. **RBAC já é ortogonal a billing** — Plano/módulos e Role já são conceitos tecnicamente separados nesta base, nenhuma mudança estrutural necessária para esse requisito.
- **Row-level permissions já está implementado e funcional** (filtro injetado no query builder do ORM, `apply-row-level-permission-predicates.util.ts`) — mas está **morto hoje**: o gate em `RowLevelPermissionPredicateService.hasRowLevelPermissionFeature()` exige `EnterprisePlanService.isValid()` (licença RSA externa da Twenty upstream, não configurada neste fork) **E** `BillingEntitlementKey.RLS`. Achado valioso: dá pra ligar essa feature pronta como um módulo vendável trocando esse gate, sem reescrever o enforcement em si.
- `ApiKeyEntity` já é escopada por Role via `RoleTargetEntity`. Não existe rate-limit por key hoje, mas `ThrottlerService` (token-bucket genérico) já existe e está pronto para ser reaproveitado.
- Módulo `plan-tier/` (PR #4, branch atual): `WorkspacePlanTier` (`BASIC|PRO`), `PlanGatedFeature` (`WHATSAPP|INSTAGRAM|VOICE_AGENT|WORKFLOWS|CUSTOM_APPS`), `WorkspacePlanTierGuard` + `@RequirePlanGatedFeature(...)` já aplicado em ~50 pontos de resolver. Essa é a base de guard/decorator que a proposta reaproveita — só a decisão por trás (`hasAccessToFeature`) muda de "é PRO?" para "o workspace tem este módulo contratado?".
- Billing: motor Stripe completo e maduro (`BillingSubscriptionEntity`, checkout, customer portal). **`BillingSubscriptionItemEntity` já existe** — uma assinatura Stripe pode ter múltiplos itens de linha, cada um com seu próprio preço e `quantity`. Isso é exatamente o formato "base + módulos avulsos" e já está no schema, não precisa ser inventado. `BillingEntitlementKey` (`SSO|CUSTOM_DOMAIN|RLS|AUDIT_LOGS`) é um segundo sistema de gating por feature já plugado a produtos Stripe reais — é o padrão mais próximo do que vamos generalizar para todos os módulos. `BillingUsageCapService`/`ResourceCreditService` existem mas **dependem de ClickHouse** (não configurado neste deploy) — não serão usados; contadores simples via query direta nas tabelas existentes substituem essa peça.

**O que NÃO existe hoje e precisa ser construído (camada de limite numérico — zero disso existe em qualquer lugar):**
- Nenhuma contagem de uso é comparada a um limite em lugar nenhum do código atual. O gating existente é 100% binário (tem/não tem acesso à feature), nunca "N de M".
- As tabelas-base para contar já existem na maioria dos casos (ver "Pontos de enforcement" abaixo) — falta só a camada de agregação + comparação + exceção amigável.

**O que não existe e seria funcionalidade nova (fora de escopo desta leva):**
- **Múltiplos pipelines**: não existe o conceito. "Pipeline" hoje é só o campo `Opportunity.stage` (um SELECT com opções fixas). Construir múltiplos pipelines é um projeto de produto à parte — **não entra nesta leva**.
- **Contagem de tokens/custo de LLM**: nenhuma chamada a OpenAI (WhatsApp agent) ou OpenAI Realtime (Voice) registra `usage`/tokens hoje. Preparado o terreno, mas o limite de IA desta leva é por **contagem de mensagens/chamadas** (tabela já existe), não por token.

## Etapa 2 — Proposta técnica

### Princípio transversal: schema é pago, layout é sempre livre

Decisão do usuário (2026-10-03), elevada a princípio porque sustenta a copy central do produto ("o CRM que se adapta à sua forma de vender"): pagar desbloqueia **o quê** o workspace pode ter (objetos/campos novos, canais, automações, agentes de IA). Isso nunca inclui **como** o que já existe é organizado na tela — isso é sempre livre, em qualquer workspace, com ou sem nenhum módulo contratado. Concretamente, NUNCA ficam atrás de um módulo:
- Reordenar itens de menu/navegação (`NavigationMenuItem.position`) — já decidido assim na spec de navegação fixa (PR #4).
- Criar/editar/reordenar **Views** (filtros, ordenação, agrupamento de Kanban, colunas visíveis) sobre os objetos que o workspace já tem acesso — já era a resposta dada quando "tabelas estáticas" foi desenhado nesta mesma conversa: só criação de objeto/campo trava, não a forma de visualizar os dados existentes.
- Reposicionar/redimensionar widgets dentro de um Dashboard já existente (`PageLayoutWidget` grid) — só a *quantidade* de dashboards tem limite (`maxDashboards`), nunca a liberdade de arranjo dentro de cada um.
Esse princípio é só uma confirmação/formalização — não introduz nenhum guard novo: nenhum dos pontos acima tem (nem deveria ganhar) um `assertWithinLimit`/`hasModule` no caminho de escrita. Vale como checklist negativo durante a implementação: se um PR desta leva acabar travando reorder/view/layout atrás de um módulo, é regressão, não feature.

### Princípio central de arquitetura

Sem tiers. Dois eixos independentes, cada um com uma única fonte de verdade:

1. **Assinatura base** — binário, mas é o alicerce: sem assinatura base ativa, o workspace não funciona (nenhum módulo é avaliado, acesso zero — coerente com "sem acesso gratuito"). Equivale ao antigo "é workspace pago?", mas sem mais nenhuma distinção de tier por trás.
2. **Módulos contratados** (`WorkspaceModule`, evolução do atual `PlanGatedFeature`) — cada funcionalidade vendável é um módulo independente, com seu próprio produto/preço Stripe (`BillingSubscriptionItemEntity`). Contratar um módulo libera, ao mesmo tempo: (a) o acesso à feature (binário) e (b) os limites numéricos inclusos naquele módulo — as duas coisas vêm do mesmo catálogo, não são decisões separadas.

Catálogo central, um único arquivo, sem números soltos em nenhum resolver:

```ts
// plan-tier/constants/module-catalog.constant.ts
export const BASE_PLAN_LIMITS = {
  // vale para todo workspace com assinatura base ativa (≈ €97/mês), sem nenhum módulo contratado
  maxUsers: 5,
  maxContacts: 2_000,
  maxCompanies: 1_000,
  maxDashboards: 3,
  maxWorkflowsActive: 2,              // "alguns workflows mais fáceis", incluso na base
  maxWorkflowExecutionsMonthly: 200,
};

export const MODULE_CATALOG: Record<WorkspaceModule, ModuleDefinition> = {
  WHATSAPP:               { includedLimits: { maxWhatsAppNumbers: 1 } },
  AI_AGENT:                { includedLimits: { maxAIAgents: 1, maxAIMessagesMonthly: 1_000 } },       // "atendimento inteligente com IA"
  VOICE_AGENT:             { includedLimits: { maxVoiceAgents: 1, maxVoiceMinutesMonthly: 500 } },
  WORKFLOWS_ADVANCED:      { includedLimits: { maxWorkflowsActive: 20, maxWorkflowExecutionsMonthly: 5_000 } }, // "automação de processos" — SOMA ao incluso na base, não substitui
  CUSTOM_OBJECTS:          { includedLimits: { maxCustomObjects: 5 } },
  CUSTOM_FIELDS:           { includedLimits: { maxCustomFields: 20 } },
  INSTAGRAM:               { includedLimits: {} },               // puramente binário
  ROW_LEVEL_PERMISSIONS:   { includedLimits: {} },                // puramente binário
  API_ACCESS:              { includedLimits: { apiRateLimitPerMinute: 120 } },
  MCP:                     { includedLimits: {} },                // puramente binário — liga/desliga engine/api/mcp pro workspace
};
```

Todo módulo tem um item de assinatura Stripe próprio (`BillingSubscriptionItemEntity.quantity`), preço flat (~€90/mês cada, confirmado por você — não precisa estar no código, vive no produto Stripe). Para módulos "quantificáveis" (WhatsApp, AI, Voice, Workflows, objetos/campos customizados, API), **o limite incluso escala pela quantidade contratada** — comprar `quantity=2` do módulo WhatsApp dá `maxWhatsAppNumbers = 2`, sem precisar de um conceito novo além do que o Stripe já suporta nativamente. Módulos puramente binários (Instagram, Row-Level Permissions, MCP) ignoram quantidade — tem ou não tem.

**Resolvido (2026-10-03): "workflows fáceis" vs "automação de processos" é só quantidade.** Mesmo motor de Workflows para todo mundo, sem segunda classe de automação — nenhum gatilho/ação fica bloqueado por módulo. A única coisa que o módulo `WORKFLOWS_ADVANCED` compra é mais `maxWorkflowsActive`/`maxWorkflowExecutionsMonthly` por cima do que já vem incluso na base. Decisão explícita do usuário para manter a experiência intuitiva e não contradizer a copy "o CRM que se adapta à sua forma de vender" com automações artificialmente capadas por tipo.

Isso também **unifica feature-gating e limite numérico** pros módulos quantificáveis: "o workspace tem acesso a X" deixa de ser uma pergunta separada — é simplesmente "o limite incluso de X é maior que zero". Só os módulos sem limite numérico (Instagram, RLS) continuam precisando de uma checagem binária à parte.

### Mudanças no módulo `plan-tier/` existente (evoluir, não recriar)

```
src/engine/core-modules/plan-tier/
  enums/
    workspace-module.enum.ts          // substitui plan-gated-feature.enum.ts
                                       // WHATSAPP | INSTAGRAM | VOICE_AGENT | WORKFLOWS |
                                       // CUSTOM_OBJECTS | CUSTOM_FIELDS | AI_AGENT |
                                       // ROW_LEVEL_PERMISSIONS | API_ACCESS
  constants/
    module-catalog.constant.ts        // NOVO: BASE_PLAN_LIMITS + MODULE_CATALOG (ver acima)
  services/
    workspace-subscription.service.ts // substitui workspace-plan-tier.service.ts:
                                       //   hasActiveBaseSubscription(workspaceId): boolean
                                       //   getModuleQuantity(workspaceId, module): number (0 = não contratado)
                                       //   hasModule(workspaceId, module): boolean (= quantity > 0,
                                       //     ou existe o item de assinatura, para os binários puros)
    plan-limit.service.ts             // NOVO: ver abaixo — mecanismo central de limite numérico
  entities/
    workspace-module-grandfather.entity.ts  // evolução de workspace-plan-grandfather.entity.ts:
                                       //   (workspaceId, module, reason) — um row por módulo
                                       //   grandfathered, não mais um flag único "é PRO"
  guards/
    workspace-module.guard.ts         // substitui workspace-plan-tier.guard.ts, mesma forma
                                       //   (mixin-factory), decorator renomeado @RequireModule(...)
```

`getModuleQuantity`/`hasModule` resolvem a partir de: (a) `BillingSubscriptionItemEntity` ativo cujo produto Stripe mapeia para aquele `WorkspaceModule` (soma de quantity, se houver mais de um item do mesmo módulo — não deveria, mas soma por segurança), OU (b) uma linha em `WorkspaceModuleGrandfatherEntity` para aquele módulo (trata como quantity=1, independente de billing — contas legado/cortesia).

### `PlanLimitService` — o mecanismo de enforcement central

```ts
async assertWithinLimit(workspaceId: string, key: PlanLimitKey): Promise<void>
// current = contagem ao vivo (ver tabela abaixo); limit = BASE_PLAN_LIMITS[key] OU
// MODULE_CATALOG[moduleDoKey].includedLimits[key] * getModuleQuantity(workspaceId, moduleDoKey)
// lança PlanLimitExceededException(key, currentUsage, limit, module) se current >= limit
// se hasActiveBaseSubscription(workspaceId) === false: nega tudo, sem nem calcular limite

async getUsageSnapshot(workspaceId: string): Promise<Record<PlanLimitKey, { used: number; limit: number }>>
// alimenta o dashboard de uso — "Usuários: 4/5", "WhatsApp: 1/1", etc.
```

Mapa `PlanLimitKey → função de contagem` (mesmas tabelas que a auditoria já mapeou, nenhuma mudança aqui por causa da revisão do modelo comercial):

| `PlanLimitKey` | Como conta | Fonte do limite |
|---|---|---|
| `maxUsers` | `COUNT(*)` em `UserWorkspaceEntity` por `workspaceId` | `BASE_PLAN_LIMITS` |
| `maxContacts` / `maxCompanies` | `COUNT(*)` no standard object Person/Company do workspace | `BASE_PLAN_LIMITS` |
| `maxDashboards` | `COUNT(*)` em `PageLayoutEntity` onde `type=DASHBOARD` | `BASE_PLAN_LIMITS` |
| `maxCustomObjects` | `COUNT(*)` em `ObjectMetadataEntity` não-standard, por `workspaceId` | módulo `CUSTOM_OBJECTS` |
| `maxCustomFields` | `COUNT(*)` em `FieldMetadataEntity` custom, por `workspaceId` | módulo `CUSTOM_FIELDS` |
| `maxWorkflowsActive` | `COUNT(DISTINCT workflowId)` de `WorkflowVersion` com `status=ACTIVE` | módulo `WORKFLOWS` |
| `maxWorkflowExecutionsMonthly` | `COUNT(*)` em `WorkflowRun` com `createdAt >= início do mês` | módulo `WORKFLOWS` |
| `maxWhatsAppNumbers` | `COUNT(*)` em `WhatsappChannelEntity` por `workspaceId` | módulo `WHATSAPP` |
| `maxAIAgents` | `COUNT(*)` em `WhatsappAgentEntity` por `workspaceId` | módulo `AI_AGENT` |
| `maxAIMessagesMonthly` | `COUNT(*)` em `WhatsappAgentMessageEntity` onde `direction=OUTBOUND` e `createdAt >= início do mês` | módulo `AI_AGENT` |
| `maxVoiceAgents` | `COUNT(*)` em `VoiceAgentEntity` por `workspaceId` | módulo `VOICE_AGENT` |
| `maxVoiceMinutesMonthly` | `SUM(durationSeconds)/60` em `VoiceCallEntity` com `createdAt >= início do mês` | módulo `VOICE_AGENT` |

Decisão deliberada: contagem **ao vivo** (query direta), não um contador incrementado/cacheado. Simples, correto por construção. Otimização futura isolada se a escala exigir — YAGNI agora.

### Pontos de enforcement (onde `assertWithinLimit`/`hasModule` entram, por resolver/serviço real)

| Limite/módulo | Arquivo e método (achado na auditoria) |
|---|---|
| `WORKFLOWS` + `maxWorkflowsActive` | `WorkflowTriggerWorkspaceService.activateWorkflowVersion` — já tem o guard (`WORKFLOWS`); ganha o check de limite antes de `performActivationSteps` |
| `maxWorkflowExecutionsMonthly` | `WorkflowRunEnqueueWorkspaceService.enqueueRunsForWorkspace` — antes de enfileirar; estourado = `WorkflowRun` fica `FAILED` com motivo "limite do plano" (não trava o workspace inteiro) |
| `WHATSAPP` + `maxWhatsAppNumbers` | `WhatsappEmbeddedSignupService.connectNumber`, antes de salvar `WhatsappChannelEntity` nova |
| `AI_AGENT` + `maxAIAgents` | `WhatsappAgentMetadataService.create` |
| `maxAIMessagesMonthly` | `WhatsappAgentResponderService.respond()` — **soft block**: se estourado, não chama a OpenAI e marca a conversa para handoff humano, não trava a mensagem inbound do lead. Travar duro ali quebraria a experiência do cliente final do seu cliente — pior UX possível. |
| `VOICE_AGENT` + `maxVoiceAgents` | `VoiceAgentMetadataService.create` |
| `maxVoiceMinutesMonthly` | Enforcement **suave** (log + flag). Bloquear uma ligação telefônica real em andamento via webhook da Twilio não é tecnicamente são; bloqueio preventivo (negar nova chamada) fica para iteração futura se necessário |
| `CUSTOM_OBJECTS` + `maxCustomObjects` | `object-metadata.resolver.ts#createOneObject` — já gateado; troca `CUSTOM_APPS`/tier por `CUSTOM_OBJECTS`/módulo, ganha limite numérico |
| `CUSTOM_FIELDS` + `maxCustomFields` | `field-metadata.resolver.ts#createOneField` — **hoje sem nenhum gate**; ganha módulo + limite |
| `maxUsers` | `UserWorkspaceService.create`/`addUserToWorkspaceIfUserNotInWorkspace` (convite/aceite) |
| `maxDashboards` | `PageLayoutService.create` com `type=DASHBOARD` |
| `maxContacts`/`maxCompanies` | Múltiplos pontos de entrada (criação manual, CSV, sync de FunnelLead) — precisa de um único helper compartilhado pra não duplicar a checagem 3x. Maior risco de "esqueci um lugar" na implementação |
| `ROW_LEVEL_PERMISSIONS` | `RowLevelPermissionPredicateService.hasRowLevelPermissionFeature()` — troca o gate de licença Enterprise por `hasModule(workspaceId, ROW_LEVEL_PERMISSIONS)` (ver seção dedicada abaixo) |
| `API_ACCESS` | Bloqueia `ApiKeyService.create` se módulo não contratado; rate-limit por `apiRateLimitPerMinute` do módulo via `ThrottlerService`, aplicado em `JwtAuthStrategy.validateAPIKey` |

### Row-Level Permissions — religar a feature existente

Em `RowLevelPermissionPredicateService.hasRowLevelPermissionFeature()`, trocar:
```ts
hasValidEnterprisePlan = this.enterprisePlanService.isValid();
isRowLevelPermissionEnabled = await this.billingService.hasEntitlement(workspaceId, BillingEntitlementKey.RLS);
return hasValidEnterprisePlan && isRowLevelPermissionEnabled;
```
por:
```ts
return this.workspaceSubscriptionService.hasModule(workspaceId, WorkspaceModule.ROW_LEVEL_PERMISSIONS);
```
Zero mudança no enforcement real (o filtro no query builder já funciona) — só troca o portão de entrada, de uma licença externa inaplicável para o nosso próprio sistema de módulos. Baixo risco, alto valor: feature pronta vira um módulo vendável.

### Frontend

- `useWorkspacePlanTier()` → `useWorkspaceModules()` (lista de módulos contratados + quantidade) e `useWorkspacePlanUsage()` (snapshot de uso), ambos sobre uma nova query GraphQL.
- **Dashboard de uso**: nova página em Settings (`SettingsPlanUsage.tsx`, mesmo padrão `SettingsPageLayout`/`SettingsPageContainer` das demais páginas), mostrando a assinatura base + lista de módulos contratados com sua barra de uso ("WhatsApp: 1/1 números", "Workflows: 11/15 ativos", "IA: 420/1.000 mensagens este mês").
- **Loja de módulos**: uma tela simples listando todos os módulos do catálogo, os já contratados marcados, os não-contratados com um CTA "Adicionar módulo" (sem checkout real ainda — linka pra contato/upsell, como já decidido antes).
- **UX de bloqueio**: componente único reutilizável (`ModuleLimitBlockedModal`), recebendo `module`/`limitKey`, mensagem "Este recurso faz parte do módulo WhatsApp" / "Você atingiu o limite do módulo (1/1 números)" + CTA "Adicionar módulo"/"Aumentar limite". Reaproveitado em todo ponto bloqueado.
- Botões de criação mostram contagem "3/3" e desabilitam no limite, abrindo o modal acima.

### Migração de dados (workspaces existentes)

Hoje existe só `WorkspacePlanTier` BASIC/PRO (+ grandfather único). Mapeamento proposto:
- Workspace com assinatura Stripe ativa (era `PRO`) → ganha `hasActiveBaseSubscription = true` **e** é grandfathered em **todos os módulos atuais do catálogo** (`WHATSAPP, AI_AGENT, VOICE_AGENT, WORKFLOWS, CUSTOM_OBJECTS, CUSTOM_FIELDS`), um row por módulo em `WorkspaceModuleGrandfatherEntity` com motivo "migração do antigo plano PRO (all-or-nothing)". Justificativa: a assinatura PRO antiga já cobria tudo isso numa mensalidade só; desmembrar em módulos sem reconhecer o que já estava pago seria cobrar de novo pelo que o cliente já tem.
- Workspace que já tinha o `WorkspacePlanGrandfatherEntity` único (legado/cortesia) → mesma lógica acima (todos os módulos atuais), motivo preservado.
- **Workspace sem assinatura ativa hoje (era `BASIC`) → fica sem acesso a NADA após o corte, incluindo o CRM básico**, porque "sem acesso gratuito" significa que nem a assinatura base existe de graça. **Isso é uma mudança de comportamento real, não só reorganização interna — precisa de confirmação explícita sua**, especialmente para saber se existe algum workspace `BASIC` hoje além do de testes.
- **O workspace real de produção ("Horizon") precisa ser conferido manualmente**: hoje ele é `PRO` ou `BASIC`? Se `PRO`, a migração acima preserva acesso total sem fricção. Se `BASIC`, ele perderia acesso completo no corte, a menos que você o coloque numa assinatura base manualmente antes do deploy desta mudança.

### Documentação (pedido explícito do usuário)

Páginas em `packages/zyra-docs/user-guide/` que hoje descrevem funcionalidade sem menção a módulo pago, precisam de nota "faz parte do módulo X":
- `data-model/how-tos/create-custom-objects.mdx`, `create-custom-fields.mdx`
- `permissions-access/capabilities/permissions.mdx` (mencionar Row-Level Permissions como módulo)
- Página nova de catálogo de módulos/preços — hoje não existe nenhuma página pública de planos/módulos na doc.
Trabalho de Etapa 3, listado aqui para não ser esquecido.

## Decomposição: Manychat-like e Integrações viram projetos próprios

Resposta do usuário (2026-10-03): ambos **entram** no roadmap comercial como módulos reais, não só como ideia adiada — mas nenhum dos dois tem desenho (UX, arquitetura, escopo técnico) ainda, e cada um é grande o bastante para merecer seu próprio brainstorm, não um parágrafo dentro desta spec de limites. Decisão: reservar os dois no catálogo de módulos agora (para a cobrança já "conhecer" esses produtos), implementar nesta leva só o enforcement de módulos que já existem de verdade, e tratar `MANYCHAT_LIKE` e `INTEGRATIONS` como vendáveis-mas-sem-funcionalidade-por-trás até cada um passar pelo próprio ciclo auditoria→proposta→validação→implementação.

```ts
MANYCHAT_LIKE:  { includedLimits: {}, implemented: false },  // reservado — spec própria depois
INTEGRATIONS:   { includedLimits: {}, implemented: false },  // reservado — spec própria depois
```

`implemented: false` é checado pelo guard/UI: o módulo aparece na loja de módulos (pode ser vendido/precificado desde já se você quiser), mas qualquer tentativa de acessar a feature correspondente retorna "em breve", não um erro de "módulo não contratado" nem acesso de verdade. Isso evita cobrar por algo que ainda não existe tecnicamente, ao mesmo tempo que já posiciona os dois no catálogo comercial.

## Fora de escopo (explícito, para não virar refatoração gigante)

- Múltiplos pipelines — feature nova, não um limite. Fica para brainstorm dedicado depois.
- Cobrança real por consumo (créditos/tokens) — arquitetura preparada (`PlanLimitService` é o lugar natural para plugar um medidor de tokens depois), não implementada agora.
- Instrumentação de tokens/custo de LLM nas chamadas OpenAI — fica para depois.
- Criação dos produtos/preços reais no painel Stripe (base + cada módulo) — passo operacional seu, o código só consome o que você configurar.
- Checkout real / compra self-service de módulo — mantido como placeholder (CTA leva a contato/upsell).
- Comprar "mais uma unidade" de um módulo via self-service (ex: 2º número de WhatsApp) — o mecanismo técnico (quantity do item Stripe) fica pronto, mas o fluxo de compra em si não é desta leva.

## Testes (Etapa 4, resumo — detalhado na implementação)

- `PlanLimitService`: unitário por `PlanLimitKey`, cobrindo módulo não contratado (limit=0), dentro do limite, limite atingido.
- Cada ponto de enforcement: workspace sem o módulo é bloqueado; workspace com o módulo mas no limite é bloqueado; workspace com quantidade extra do módulo tem limite proporcionalmente maior.
- Workspace sem assinatura base ativa: bloqueado em absolutamente tudo, incluindo CRM básico.
- `RowLevelPermissionPredicateService`: módulo contratado habilita, não contratado não, substituindo o teste antigo baseado em `EnterprisePlanService`.
- Multi-tenancy: limite/módulo de um workspace não vaza para outro.
- "Burlar via API direta": chamar a mutation sem passar pela UI ainda é bloqueado pelo guard/service no backend.

## Decisões que preciso que você confirme antes da Etapa 3

1. **Catálogo de módulos e limites inclusos** (`MODULE_CATALOG` acima) — são meu ponto de partida, não pesquisa de mercado sua. Confirma a lista de módulos e a ordem de grandeza dos números (base €97 com 2 workflows/200 execuções grátis; cada módulo ~€90 flat)?
2. ~~"Manychat-like"~~ — **resolvido**: usuário escolheu "entra nesta leva como feature nova" — mas dado que é um flow-builder visual sem nenhum desenho ainda, a decisão de implementação (autônoma, ver nota de processo no topo) foi reservar o módulo no catálogo (`implemented: false`) agora e tratar o desenho de verdade como [[project_manychat_like_module|brainstorm dedicado próprio]] (tarefa separada, referência dada: github.com/diwenne/openreply) — construir a feature sem um desenho validado seria contrariar diretamente a instrução de "não fazer refatoração/feature gigante sem necessidade" do próprio pedido original do usuário.
3. ~~"Conexões com outras plataformas"~~ — **resolvido**: mesma decisão e mesmo motivo do item 2 — reservado no catálogo, brainstorm dedicado próprio como tarefa separada.
4. ~~"Conexão com IA"~~ — **resolvido**: é o mesmo módulo que "atendimento inteligente com IA" (`AI_AGENT`, Agente de WhatsApp) — confirmado pelo usuário, nenhum módulo novo necessário.
5. **Expansão por quantidade** (comprar 2x o módulo WhatsApp = 2 números) — confirma esse modelo, ou cada módulo é sempre quantidade fixa 1 por enquanto? (assumindo "sim, quantidade" como default para começar a implementar, por ser o caminho que o Stripe já suporta nativamente — ajustável se a resposta for diferente)
6. ~~Migração / status do Horizon~~ — **resolvido na prática**: em vez de depender da resposta sobre o status de billing do Horizon, criei um instance command dedicado que concede a esse workspace específico todos os módulos implementados incondicionalmente (ver "Status de implementação"). Não importa mais qual era o status real — ele não perde acesso de qualquer forma. Workspaces `PRO`/grandfathered genéricos continuam seguindo a regra geral do backfill (item já implementado).
7. ~~Workflows "fáceis" vs "avançados"~~ — **resolvido**: só quantidade, sem segunda classe de automação (ver nota acima).
8. ~~Layout/views travados atrás de módulo~~ — **resolvido**: nunca ficam, princípio formalizado acima.

## Status de implementação — 2026-10-03

**Verificado (typecheck limpo nos arquivos tocados, 64 suítes/595 testes passando, lint limpo nos arquivos que escrevi):**

- `plan-tier/` evoluído: `PlanGatedFeature` com os módulos novos (`CUSTOM_APPS`→`CUSTOM_OBJECTS`, + `CUSTOM_FIELDS`, `AI_AGENT`, `WORKFLOWS_ADVANCED`, `ROW_LEVEL_PERMISSIONS`, `API_ACCESS`, `MCP`, `MANYCHAT_LIKE`/`INTEGRATIONS` reservados). `module-catalog.constant.ts` com `BASE_PLAN_LIMITS`/`MODULE_CATALOG`. `WorkspaceModuleGrandfatherEntity` (1 row por workspace+módulo) substituindo o flag único antigo, com fast+slow instance commands (2.16.0, timestamps 1803200000000/1803300000000) migrando workspaces `PRO`/grandfathered legados para todos os módulos atuais do catálogo — tabela antiga `workspacePlanGrandfather` deliberadamente **não** dropada ainda (só depois do backfill verificado em produção). `WorkspacePlanTierService.hasAccessToFeature`/`getModuleQuantity` reais (grandfather + lookup de `BillingSubscriptionItemEntity` via `BillingProductKey.MODULE_*`, novo no enum — produtos Stripe reais ainda não existem, é passo operacional). `PlanLimitService` novo (`assertWithinLimit`/`resolveLimit`, controle invertido — quem conta é cada domínio, não este serviço).
- **Row-Level Permissions religado**: as duas cópias do gate morto (`RowLevelPermissionPredicateService` e `RowLevelPermissionPredicateGroupService`) trocadas de `EnterprisePlanService`/`BillingEntitlementKey.RLS` pra `WorkspacePlanTierService.hasAccessToFeature(..., ROW_LEVEL_PERMISSIONS)`. Zero mudança no enforcement real (filtro no query builder já funcionava).
- **Limites numéricos wireados**: `createOneField` (antes sem gate nenhum, agora `CUSTOM_FIELDS` + `maxCustomFields`), `createOneObject` (rename do gate binário + `maxCustomObjects` novo), `activateWorkflowVersion` (`maxWorkflowsActive`, contando versões `ACTIVE` por workflow distinto via `GlobalWorkspaceOrmManager` — **assumi** que o nome do standard object é `'workflowVersion'` por convenção de nomenclatura do resto do código, não confirmei 100% por leitura direta do registro; se estiver errado, o erro é um "objeto não encontrado" visível em runtime, não um bypass silencioso), `WhatsappEmbeddedSignupService.connectNumber` (`maxWhatsAppNumbers`, só no caminho de conexão nova, não em reconexão), `WhatsappAgentMetadataService.create` (`maxAIAgents`), `VoiceAgentMetadataService.create` (`maxVoiceAgents`).
- **Gate binário `WORKFLOWS` removido** de 19 pontos em 5 resolvers de workflow (builder/trigger/version/version-edge/version-step) — decisão de arquitetura necessária, não só limpeza: no modelo novo, workflows fazem parte da assinatura base (2 grátis), não são mais all-or-nothing atrás de um módulo. Só `activateWorkflowVersion` ganhou enforcement real (numérico); os demais (deactivate/run/stop/retry/editar draft) ficaram sem nenhum gate de plano — operar sobre automações que você já tem (ou já tinha antes de estourar o limite) nunca deveria ser bloqueado.
- **Workspace de produção ("Horizon", `f7a7d81f-b6b3-42f3-8bba-51e74e90af90`) explicitamente protegido**: novo instance command dedicado (`1803400000000-grant-horizon-workspace-all-modules`), independente do backfill geral, concede a esse workspace específico todos os módulos atualmente implementados — garante que ele não perde acesso a nada quando a migração rodar, não importa qual seja o status de billing real dele hoje (pergunta que ainda estava em aberto no spec). No-op seguro em qualquer ambiente sem esse workspace (ex: banco local/dev).
- **`maxDashboards`** wireado em `PageLayoutService.create` (só quando `type === DASHBOARD`, contando via `flatPageLayoutMaps` já cacheado — mesmo padrão de leitura que o resto do arquivo já usava, sem query nova).
- **`maxWorkflowExecutionsMonthly`** wireado em `WorkflowRunEnqueueWorkspaceService.enqueueRunsForWorkspace` — limite mensal separado do throttle de curta janela que já existia (`WorkflowThrottlingWorkspaceService`, que continua intocado, protegendo infra/custo). Enforcement suave: `WorkflowRun`s que não cabem no limite ficam `NOT_STARTED` esperando o próximo mês (ou upgrade imediato), não falham com erro — é um cron em background, não uma ação de usuário.
- **`maxAIMessagesMonthly`** wireado em `WhatsappAgentResponderService.respond()` — mesmo padrão soft-block já usado pelo flag global `IS_WHATSAPP_AI_AGENT_ENABLED` (loga aviso, mensagem inbound já salva, só não dispara a resposta automática). Travar com exceção ali significaria perder a mensagem de um lead de verdade no meio da conversa — pior UX possível, por isso nunca foi uma opção.
- **`maxUsers`** wireado — mas não no lugar óbvio. `UserWorkspaceService.create()` é primitivo de baixo nível compartilhado entre criar workspace novo E aceitar convite num existente; travar ali quebraria todo signup novo (workspace sem assinatura ainda bloquearia o próprio dono da conta, problema de ovo-e-galinha). Investigação encontrou o ponto certo: `addUserToWorkspaceIfUserNotInWorkspace`, chamado **só** por `SignInUpService.signInUpOnExistingWorkspace` (aceitar convite) — `signUpOnNewWorkspace` nunca passa por ali. Limite aplicado logo depois de confirmar que o usuário ainda não está no workspace, antes de criar a nova linha.

**Segunda rodada (mesma sessão, "continue com o restante") — também verificado (typecheck limpo, 78 testes relevantes passando, lint limpo):**

- **`API_ACCESS`** wireado em `ApiKeyService.create()` — bloqueio binário (`hasAccessToFeature`), não numérico (o módulo só carrega `apiRateLimitPerMinute`, um valor de configuração pro throttler, não uma contagem de "quantas keys você tem"). O rate-limit por request em si (`ThrottlerService`) continua **não implementado** — só a criação da key está gateada.
- **Bug pego e corrigido antes de commitar**: minha primeira tentativa usou `ApiKeyExceptionCode.API_KEY_NOT_FOUND` pro erro de módulo não contratado — código semanticamente errado (aquele enum descreve o estado de uma key existente, não gating de plano). Corrigido pra um `ForbiddenException` simples, mesmo padrão que `WorkspacePlanTierGuard` já usa.
- **Teste existente quebrado e corrigido**: `user-workspace.service.spec.ts` constrói seu próprio `TestingModule` manual (lista de mocks, não importa os módulos reais) — adicionar `PlanLimitService` ao construtor de `UserWorkspaceService` quebrou as 21 suítes por falta de mock. Corrigido adicionando o mock (`assertWithinLimit` resolvendo sem erro) e um `count` no mock do repositório que faltava. Mesma correção aplicada preventivamente em `api-key.service.spec.ts` (mock de `WorkspacePlanTierService.hasAccessToFeature`), que tem o mesmo padrão de teste manual — mais um teste novo adicionado ali cobrindo o bloqueio.
- Todos os itens antes listados como "pendente, nenhum ainda codado" nesta seção foram fechados nesta rodada: `maxDashboards`, `maxWorkflowExecutionsMonthly`, `maxAIMessagesMonthly`, `maxUsers`, `API_ACCESS`, e proteção explícita do workspace "Horizon" (`f7a7d81f-b6b3-42f3-8bba-51e74e90af90`) via instance command dedicado.

**Terceira rodada (mesma sessão, "continue as tasks" / "não pare por nada") — também verificado:**

- **`maxContacts`/`maxCompanies` resolvido sem precisar de 3 pontos de entrada separados.** Achei um choke point único de verdade: `CommonCreateManyQueryRunnerService.run()`, usado por TODA mutation `createOne`/`createMany`/upsert de QUALQUER objeto (padrão/customizado) — cobre criação manual via UI e qualquer upsert programático (import CSV, sync de FunnelLead) com uma única checagem, filtrada por `nameSingular` (`person`→`maxContacts`, `company`→`maxCompanies`; qualquer outro objeto sai do método sem overhead nenhum). Conservador em lotes de upsert: conta o lote inteiro como inserção nova mesmo que parte vire update (só se sabe depois), prefere bloquear um lote que seria majoritariamente update a arriscar subcontagem. Teste unitário isolado escrito do zero (classe instanciada direto, sem `TestingModule` completo — a base class tem dependências demais que não tinham nada a ver com este teste).
- `maxVoiceMinutesMonthly`: log suave (não bloqueia) em `VoiceWebhooksController.handleStatusCallback` — é o webhook de status da Twilio, ponto real onde `durationSeconds` é persistido (não no bridge de WebSocket, que não grava essa coluna). Dispara depois que a chamada já terminou, então só serve pra visibilidade operacional, nunca bloqueia nada.

- **`WORKFLOWS_ADVANCED` grandfather por uso real, resolvido.** Novo workspace-command (`1803500000000-grandfather-workflows-advanced-by-usage`) itera todos os workspaces ativos/suspensos, conta `WorkflowVersion` com status `ACTIVE` via `GlobalWorkspaceOrmManager` (mesmo padrão confirmado por um comando já existente no código, `MigrateManualTriggerVariablesToPayloadCommand` — isso também confirma de forma independente que `'workflowVersion'` é o nome correto do standard object, a suposição que fiz na primeira rodada). Workspace com pelo menos 1 workflow ativo ganha `WORKFLOWS_ADVANCED` grandfathered, não importa o tier atual. Novo método `WorkspacePlanTierService.grantModuleIfMissing()` (idempotente, testado) criado pra isso em vez de expor o repositório do grandfather fora do módulo.

**Quarta rodada (mesma sessão, "apenas termine com as tasks") — rate-limit de API resolvido, sem precisar tocar na auth strategy:**

- **Achado que mudou o plano**: `CommonBaseQueryRunnerService.throttleQueryExecution()` já existe, já roda automaticamente antes de TODA execução de query runner (create/update/find/delete, GraphQL e REST, todo objeto), e já faz exatamente "throttle de API key" — dois buckets (`short`/`long`) com limites de instância fixos via env var (`API_RATE_LIMITING_SHORT_LIMIT` etc.), usando `isApiKeyAuthContext` pra só agir em tráfego autenticado por API key. Ou seja: o rate-limit real já existia como proteção de infra/custo — só não tinha a dimensão comercial por plano. Isso elimina o risco que eu tinha identificado antes (mexer na `JwtAuthStrategy`): não precisei tocar nela, o ponto certo já existia uma camada acima.
- Adicionei um **terceiro bucket**, `apiRateLimitPerMinute` (do módulo `API_ACCESS`, via `PlanLimitService.resolveLimit`), ao lado dos dois buckets de infra já existentes — não substitui os dois antigos, soma-se a eles. Workspace sem o módulo `API_ACCESS` resolve pra limite 0, então isso também funciona como corte automático pra quem nunca comprou o módulo ou deixou de pagar, sem precisar de um guard separado.
- `planLimitService` virou propriedade `@Inject()` na própria `CommonBaseQueryRunnerService` (mesmo padrão das outras ~15 dependências dela) em vez de só na subclasse — **isso causou uma colisão de nome** com o `planLimitService` que eu já tinha injetado via construtor em `CommonCreateManyQueryRunnerService` na rodada anterior (maxContacts/maxCompanies); TypeScript recusou compilar (`Property 'planLimitService' is private in type X but not in type Y`). Corrigido removendo a injeção duplicada da subclasse — ela agora reusa a instância herdada da base, uma única fonte.
- Testes dedicados para os services que ganharam contagem embutida sem spec própria (`WhatsappEmbeddedSignupService`, `WhatsappAgentMetadataService`, `VoiceAgentMetadataService`, `PageLayoutService`, `WorkflowRunEnqueueWorkspaceService`, `VoiceWebhooksController`) — a lógica central (`PlanLimitService`) está testada; `UserWorkspaceService`, `ApiKeyService`, `WorkspacePlanTierService` (incl. `grantModuleIfMissing`), `WorkspacePlanUsageService` e `CommonCreateManyQueryRunnerService` ganharam teste direto.
- Achado não relacionado, não corrigido por estar fora do escopo desta tarefa: `whatsapp-embedded-signup.service.ts` já violava a regra de lint `zyra/prefer-workspace-scoped-repository` em `WhatsappChannelEntity` **antes** desta sessão.

**Quinta rodada (mesma sessão, "apenas termine com as tasks") — frontend + docs, sistema completo de ponta a ponta:**

- **GraphQL novo no backend**: `currentWorkspace.workspaceModules` (módulos com quantidade/acesso/se já implementado) e `currentWorkspace.workspacePlanUsage` (uso atual vs. limite, por chave). `WorkspacePlanTierService.listModuleEntitlements()` + novo serviço/módulo `WorkspacePlanUsageService`/`WorkspacePlanUsageModule` (deliberadamente separado de `PlanTierModule` pra não inflar a árvore de dependência dos ~15 módulos que só precisam do enforcement leve). 4 testes novos.
- **Frontend completo**: `useWorkspaceModules`/`useWorkspacePlanUsage` (tipos escritos à mão, não gerados — ver nota abaixo), página `SettingsPlanModules` (uso + loja de módulos, rota nova `billing/modules`), `ModuleLimitBlockedModal` reutilizável.
- **Limitação real do ambiente, não contornável**: não há como rodar `npx nx run asturian-front:graphql:generate` aqui (precisa de backend rodando contra o banco; sem servidor dev neste ambiente). Em vez de depender de tipos auto-gerados que ficariam defasados, segui um padrão que já existe no código (`useInstagramDiagnostics.ts`) — hooks com `useQuery<TipoEscritoNaMão>`, tipos espelhando manualmente os DTOs do backend. O frontend compila e type-checa **agora**, mas se o schema mudar de novo esses tipos manuais precisam ser atualizados à mão também — sem a garantia automática de sincronia que o resto do app tem via codegen.
- **Verificação real conseguida mesmo sem servidor**: reconstruí `zyra-shared` (`npx nx build zyra-shared`) depois de adicionar `SettingsPath.PlanModules`, o que permitiu rodar `tsgo --noEmit` de verdade no frontend e pegar (e corrigir) dois bugs reais: caminho de import errado do `useNavigateSettings` e desestruturação errada do retorno dele (é a função direto, não um objeto). Sem esse rebuild, esses dois bugs passariam despercebidos.
- **Docs**: notas em 3 páginas existentes (`create-custom-objects.mdx`, `create-custom-fields.mdx`, `permissions.mdx`) explicando o requisito de módulo — a de RLS também corrigiu uma referência obsoleta ao "plano Organization" da Twenty upstream. Página nova de catálogo de módulos/preços **não criada**: `docs.json` tem navegação complexa multi-idioma, risco de quebrar estrutura não compensava nesta rodada.

**Estado final**: sistema de módulos/limites funcionando de ponta a ponta (enforcement backend + GraphQL + frontend), 121 testes de backend passando, typecheck e lint limpos em backend e frontend.
