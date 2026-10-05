# Itens fixos de nav/Settings travados por módulo pago

Status: aprovado (brainstorm conversacional, 2026-10-05).

## Contexto

Hoje, os itens de nav e cards de Settings ligados a módulos pagos (WhatsApp, Instagram/automação,
Voice Agent, AI Agent) só são condicionados a **flags globais de instância**
(`isWhatsappMessagingEnabledState`, `isInstagramMessagingEnabledState`, `isVoiceAgentEnabledState`,
`isWhatsappAiAgentEnabledState`) — ou seja, controlam se a integração existe tecnicamente nesse
deploy, não se o workspace específico pagou pelo módulo (`WorkspacePlanTierService` /
`useWorkspaceModules()`). O backend já gateia as mutations reais por módulo (ver
[[project_saas_plan_tiers]]), mas a navegação visual não reflete isso: todo workspace vê os mesmos
itens, pagando ou não.

Já existe `ModuleLimitBlockedModal` (`packages/asturian-front/src/modules/workspace/components/`),
mas nenhum lugar da UI o abre ainda.

Pedido do usuário: "o visual do manychat like e do whatsapp como partes fixas, porém que só
ativadas num workspace se pagas" — decisões tomadas no brainstorm expandiram isso pra um padrão
geral.

**Reverte uma decisão anterior**: o spec `2026-10-01-plan-tier-gating-and-workshop-whatsapp-design.md`
tinha decidido "esconder, não travar" (itens gateados somem completamente pra quem não pagou). Esta
decisão nova é o oposto para os itens aqui listados: sempre visíveis, travados visualmente até a
compra. Isso não afeta a navegação customizável (pastas/drag-and-drop) nem o redesign maior de
"navegação fixa" ainda não implementado — são iniciativas independentes.

## Decisões

1. **Visível sempre, travado até pagar** (não escondido). Funciona como gancho de upsell direto na
   navegação.
2. **Clique num item travado abre `ModuleLimitBlockedModal`** (já existe, passa a ser conectado),
   não navega pra rota real.
3. **Escopo: todos os módulos pagos que hoje já têm um item fixo de nav/Settings** — não só
   WhatsApp/Manychat-like. Módulos sem um item fixo hoje (Custom Objects/Fields, Workflows Advanced,
   Row-Level Permissions, API Access, MCP) ficam fora — eles não têm um "item fixo" nesse sentido
   (são objetos dinâmicos ou configurações sem card próprio).
4. **Aplica em dois lugares**: a sidebar principal fixa (`NavigationDrawerOtherSection.tsx`) e os
   cards de integração em Settings (`SettingsAccountsSettingsSection.tsx`).
5. **Independente do redesign maior de "navegação fixa"** (pastas/drag-and-drop) — não toca nisso.
6. **O card hoje rotulado "Instagram"** continua com esse nome na UI, mas a trava usa o módulo
   `MANYCHAT_LIKE` (o que o backend realmente exige nas mutations de `InstagramAutomationRuleEntity`),
   não `INSTAGRAM` — evita destravar o card pra quem não comprou o módulo de automação e levar a um
   403 ao usar de verdade.

## Itens em escopo e mapeamento de módulo

| Local | Item | `PlanGatedFeature` |
|---|---|---|
| `NavigationDrawerOtherSection.tsx` | WhatsApp Inbox | `WHATSAPP` |
| `SettingsAccountsSettingsSection.tsx` | WhatsApp | `WHATSAPP` |
| `SettingsAccountsSettingsSection.tsx` | WhatsApp Templates | `WHATSAPP` |
| `SettingsAccountsSettingsSection.tsx` | Instagram (rótulo inalterado) | `MANYCHAT_LIKE` |
| `SettingsAccountsSettingsSection.tsx` | Voice AI Agent | `VOICE_AGENT` |
| `SettingsAccountsSettingsSection.tsx` | WhatsApp AI Agent | `AI_AGENT` |

A flag de instância atual de cada item continua como pré-requisito (controla se a feature existe
nesse deploy); o gate de módulo pago é uma camada adicional por cima, não uma substituição.

**A confirmar durante a implementação** (verificação de código, não decisão de design): se a página
`AccountsInstagram` tiver uma sub-parte de "conectar conta" distinta da automação de comentário→DM
(ex. gateada por `INSTAGRAM` puro no backend), decidir se o card cobre as duas coisas ou só a
automação.

## Design — Componentes

- **`useModuleAccessGate(module: PlanGatedFeature)`** (novo hook,
  `packages/asturian-front/src/modules/workspace/hooks/`): retorna
  `{ hasAccess, isLocked, openUpsellModal }`. Usa `useWorkspaceModules().hasModule(module)`
  (já existe) + `useModal()` pra abrir uma instância de `ModuleLimitBlockedModal` com
  `featureName` humano por módulo.
- **`NavigationDrawerItemModifier`** ganha um novo valor `'locked'`, ao lado de `'soon'`/`'new'`.
  Visual parecido com `'soon'` (cor apagada, selo em vez de label simples), mas **mantém
  `cursor: pointer` e `pointer-events: auto`** — diferente de "soon", é clicável (abre o upsell).
  Selo usa ícone de cadeado em vez do texto "Soon".
- **`SettingsCard`**: nenhuma mudança no componente — já suporta `Status` (slot pra selo) e
  `onClick` customizado. Quando travado: `Status={<Pill Icon={IconLock} label={t\`Bloqueado\`} />}`
  e a navegação via `UndecoratedLink to=...` é substituída por um clique que chama
  `openUpsellModal`, sem link real.

## Design — Fluxo de dados e edge cases

- Fonte de verdade: `useWorkspaceModules()` (query GraphQL já existente,
  `currentWorkspace.workspaceModules`). Nenhum campo novo de backend.
- **Carregando** (`loading === true`): tratado como não travado ainda, pra não "piscar" cadeado e
  depois sumir — aplica o estado travado só quando a resposta resolver negativa.
- **Falha na query**: fail-closed (`hasAccess: false`), mesmo comportamento já existente de
  `hasModule()`.
- **Clique travado**: nunca navega (sem `to`/`Link`), só abre o modal com o `featureName` certo. O
  modal já linka pra `SettingsPath.PlanModules`.
- **Workspace compra o módulo**: destrava no próximo fetch da query, reativo ao cache do Apollo, sem
  precisar de refresh de página.

## Testes

- `useModuleAccessGate`: unitário mockando `useWorkspaceModules` — `hasAccess=true` (não travado),
  `hasAccess=false` (travado, `openUpsellModal` dispara), `loading=true` (não travado).
- `NavigationDrawerItem` com `modifier="locked"`: garante selo de cadeado, `onClick` funcional, sem
  navegação (sem `to`).
- `NavigationDrawerOtherSection` e `SettingsAccountsSettingsSection`: um teste RTL por seção —
  módulo não contratado → clique abre modal, não navega; módulo contratado → comportamento idêntico
  ao atual (regressão zero no caminho "pago").

## Fora de escopo (explícito)

- Redesign maior de "navegação fixa" (desativar pastas/criação de item customizado) — iniciativa
  separada, ainda 0% implementada, não tocada aqui.
- Módulos sem item fixo hoje (Custom Objects/Fields, Workflows Advanced, Row-Level Permissions, API
  Access, MCP) — sem superfície de nav pra travar.
- Qualquer mudança na checagem de backend (já gateada corretamente nos resolvers).

## Tarefa relacionada, fora deste spec: grant do módulo MANYCHAT_LIKE pro workspace Horizon

Pedido à parte feito na mesma conversa: "adicione eles ao workspace da Horizon" (WhatsApp +
Manychat-like). `WHATSAPP` já está coberto pela instance command existente
`2-16-instance-command-slow-1803400000000-grant-horizon-workspace-all-modules.ts`. Essa command **não
deve ser editada** (regra do projeto: nunca reescrever lógica de instance command já commitada) —
ela excluía `MANYCHAT_LIKE`/`INTEGRATIONS` de propósito, porque na época em que foi escrita esses
módulos ainda não estavam `implemented: true` no catálogo (ficaram depois, na mesma sessão, onda
seis — ver [[project_saas_plan_tiers]]). Correção: uma **nova** instance command do tipo **slow**
(mesmo padrão da anterior — é um INSERT de dados via `runDataMigration`, não uma mudança de schema,
então "fast" não se aplica aqui) concedendo `MANYCHAT_LIKE` ao workspace Horizon. Fica pendente a
execução de `database:migrate` na VPS (só o usuário roda comandos na VPS).
