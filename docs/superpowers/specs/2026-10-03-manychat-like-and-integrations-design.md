# Módulos Manychat-like e Integrações — fechamento rápido

Status: implementado. Usuário pediu decisão autônoma ("toma decisão cara usa o /brainstorming" seguido de "existem 4 tasks e vc n fez nenhuma... faz sozinho") — pesquisa concreta substituiu um brainstorm longo porque o achado mudou o problema de "desenhar algo novo" para "religar algo que já existe".

## Achado central

Pesquisei o repo de referência dado pelo usuário (`github.com/diwenne/openreply`, "o Manychat open-source"). Não é um flow-builder genérico — é especificamente **automação de comentário-para-DM do Instagram por palavra-chave**: alguém comenta uma keyword num post, a ferramenta manda DM privada automática (+ resposta pública opcional), com link rastreado, follow-gate, múltiplas contas.

Isso já existe no Zyra, quase inteiro, com outro nome: `InstagramAutomationRuleEntity` (`engine/metadata-modules/instagram-channel/`). Cobre: palavra-chave → DM privada ✅, variações de resposta pública ✅, follow-gate ✅, DM de follow-up atrasado ✅, "anexar ao próximo Reel" (campanha antes do post existir) ✅, import CSV de regras ✅, templates de campanha ✅. Só estava gateado sob o módulo genérico `INSTAGRAM`, não como capacidade própria vendável.

**Decisão**: em vez de construir um flow-builder do zero (proposta original do spec de 3-10-2026), o módulo `MANYCHAT_LIKE` = religar essas 6 mutations/query de `INSTAGRAM` para `MANYCHAT_LIKE` como gate próprio. Zero funcionalidade nova construída — só a cobrança reconhece o que já existe como produto separado.

**Lacuna real, não fechada agora**: links rastreados com contagem de clique/CTR (feature do OpenReply que o Zyra não tem). Fora de escopo desta rodada — registrado como gap conhecido, não um bloqueador pra vender o módulo como está.

## Integrações

Mesma lógica: `WebhookEntity`/`WebhookResolver` (`engine/metadata-modules/webhook/`) já é uma capacidade real de "conectar com outras plataformas" (assinaturas de webhook de saída). Em vez de construir um framework de integração genérica do zero, `createWebhook` foi gateado sob `INTEGRATIONS` (query/update/delete do webhook continuam livres, mesmo padrão usado em `createOneObject` vs `updateOneObject`/`deleteOneObject` no spec principal).

## Mudanças de código

- `instagram-automation-rule.resolver.ts`: 6 ocorrências de `PlanGatedFeature.INSTAGRAM` → `PlanGatedFeature.MANYCHAT_LIKE`.
- `webhook.resolver.ts`: `createWebhook` ganhou `@RequirePlanGatedFeature(PlanGatedFeature.INTEGRATIONS)` + `WorkspacePlanTierGuard` a nível de classe. `webhook.module.ts` ganhou `PlanTierModule`.
- `module-catalog.constant.ts`: `MANYCHAT_LIKE` e `INTEGRATIONS` viram `implemented: true`.

## Pendente, sinalizado

- Links rastreados (clique/CTR) para o módulo Manychat-like — feature real do OpenReply que o Zyra não tem, não construída agora.
- `InstagramPublicReportResolver` não foi tocado (ficou em `INSTAGRAM`) — não ficou claro na leitura rápida se é especificamente sobre automação ou um relatório mais geral do canal; decisão conservadora de não mexer sem confirmar.
- ~~Migração/grandfather~~ — **resolvido**: novo instance command (`1803600000000-grandfather-manychat-like-and-integrations-by-usage`) concede `MANYCHAT_LIKE`/`INTEGRATIONS` a qualquer workspace que já tenha regras de automação do Instagram ou webhooks configurados, respectivamente. Ambas tabelas são core-schema, então é SQL direto (sem iteração por schema de workspace, diferente do caso do Workflow).
- Testes dedicados não escritos (nenhum spec pré-existente nesses dois resolvers pra quebrar, mas também nenhum novo escrito aqui) — typecheck e lint limpos.
