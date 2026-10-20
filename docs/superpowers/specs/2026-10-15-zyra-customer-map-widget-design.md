# Widget de mapa-múndi + dashboard "Clientes"

Status: aprovado (brainstorm conversacional, 2026-10-15/16).

## Contexto

Durante o mapeamento do kit de UI de referência ("Dashboard UI Charts", Figma Community) contra os
widgets que o Zyra já tem (ver artefato `zyra-kit-gap-map.html` publicado na conversa), identificamos
que não existe nenhum widget de mapa — e o usuário pediu explicitamente: um mapa-múndi mostrando
clientes por local, dentro de um dashboard chamado "Clientes".

Isso é uma funcionalidade nova completa (não um ajuste de tema como a etapa 1 —
[[project_etapa1_rebrand_tokens]] se esse link existir), full-stack: schema compartilhado,
backend (DTO, serviço de agregação, validação, GraphQL), frontend (renderer, query, dependência
nova), e um seed de dashboard padrão.

**Decisões já tomadas no brainstorm:**
1. "Clientes" é um **dashboard novo na navegação principal** — o sistema de dashboards
   customizáveis já existe (`packages/asturian-front/src/modules/dashboards/`, com mutations/
   queries GraphQL próprias) e qualquer usuário já pode criar um dashboard e adicionar widgets
   nele. O trabalho real que falta é o **tipo de widget de mapa** em si.
2. **Escopo: construir o widget E semear um dashboard "Clientes" padrão** (igual ao "My First
   Dashboard" que já vem pronto hoje) — não basta só o tipo de widget existir, ele deve aparecer
   pronto pra uso.
3. **Métrica: só contagem de clientes por país** — sem configuração de operação de agregação
   (soma, média, etc.) nesta primeira versão. Mais simples que o pie chart/bar chart, que são
   totalmente configuráveis.
4. **Dado**: `Company.addressCountry` já existe em todo registro
   (`packages/zyra-shared/src/types/composite-types/address.composite-type.ts:38`,
   `packages/zyra-server/src/modules/company/standard-objects/company.workspace-entity.ts:39`) —
   não precisa de infraestrutura de localização nova.

## Arquitetura — reaproveitar o padrão do pie chart

O pie chart já faz exatamente "agrupar registros por um campo, contar" — a mesma computação que o
mapa precisa, só muda como o resultado é desenhado (fatias vs. países coloridos). Em vez de
inventar um padrão novo, o widget de mapa **segue o mesmo esqueleto ponta a ponta que o pie chart
já usa**, com os mesmos pontos de registro:

### Shared (`zyra-shared`)
- `packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts` — nova
  `MapChartConfiguration` (tipo `BaseChartConfiguration & { configurationType: 'MAP_CHART';
  groupByFieldMetadataId: SerializedRelation; groupBySubFieldName?: string }` — sem
  `aggregateOperation` configurável, fixo em contagem), adicionada à union
  `PageLayoutWidgetConfiguration`.

### Backend (`zyra-server`)
- `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum.ts`
  — adicionar `MAP_CHART` ao `GraphType` (precisa ser subconjunto de `WidgetConfigurationType`,
  há uma asserção de tipo em tempo de compilação garantindo isso —
  `widget-configuration-type.type.ts:42-45`).
- `.../enums/widget-configuration-type.type.ts` — adicionar `MAP_CHART = GraphType.MAP_CHART` e
  incluir em `AllGraphWidgetConfigurationType`.
- `.../dtos/map-chart-configuration.dto.ts` (novo) — espelha
  `pie-chart-configuration.dto.ts`, mas **sem** `aggregateFieldMetadataId`/`aggregateOperation`
  (contagem é implícita), sem `showCenterMetric`/`displayLegend`/`hideEmptyCategory`/
  `splitMultiValueFields` (não se aplicam a mapa). Campos: `configurationType`,
  `groupByFieldMetadataId`, `groupBySubFieldName?`, `description?`, `color?`, `filter?`.
- `packages/zyra-server/src/modules/dashboard/chart-data/services/map-chart-data.service.ts`
  (novo) — reaproveita a lógica de agrupamento/contagem de
  `pie-chart-data.service.ts` (mesmo padrão de query, resultado por grupo), mas sem os conceitos
  de ordenação/slices máximas específicos de pizza.
- `.../utils/validate-widget-configuration-input.util.ts` e
  `.../utils/validate-chart-configuration-field-references.util.ts` — registrar `MAP_CHART` nos
  mesmos pontos onde `PIE_CHART` é validado hoje.
- `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util.ts`
  e o conversor inverso em
  `.../workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util.ts`
  — registrar `MAP_CHART` (necessário para migrações de workspace funcionarem).
- GraphQL: rodar `graphql:generate` depois das mudanças de schema (ver Fluxo de Trabalho no
  CLAUDE.md).

### Dashboard "Clientes" padrão
- `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/utils/page-layout-widget/`
  — hoje contém `compute-my-first-dashboard-widgets.util.ts` (widgets do dashboard padrão
  existente) e `create-standard-page-layout-widget-flat-metadata.util.ts`. Criar o equivalente
  para um dashboard "Clientes" com um widget `MAP_CHART` configurado (`groupByFieldMetadataId` =
  campo `addressCountry` do objeto `Company`).
- Como isso precisa valer tanto para workspaces novos quanto para os já existentes, requer um
  **instance command** (`database:migrate:generate --name <nome> --type slow`, conforme
  `packages/zyra-server/docs/UPGRADE_COMMANDS.md`), com lógica `up` (cria o dashboard "Clientes" +
  widget de mapa) e `down` (remove).

### Frontend (`asturian-front`)
- `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/` (novo,
  espelha a estrutura de `graph-widget-pie-chart/`): `components/GraphWidgetMapChart.tsx`,
  `hooks/useGraphMapChartWidgetData.ts` (análogo a `useGraphPieChartWidgetData.ts`), e os tipos/
  utils equivalentes que fizerem sentido (sem os conceitos específicos de pizza como ângulo de
  preenchimento, métrica central, etc.).
- `packages/asturian-front/src/modules/page-layout/widgets/graph/graphql/queries/mapChartData.ts`
  (novo, espelha `pieChartData.ts`).
- **Dependência nova**: `@nivo/geo` (mesma versão `^0.99.0` da família Nivo já usada —
  `@nivo/core`, `@nivo/line`, `@nivo/pie`, `@nivo/radial-bar` em
  `packages/asturian-front/package.json:54-57`) + um atlas TopoJSON do mundo (asset estático
  empacotado, ex. `world-countries-110m` — license-friendly, sem custo/API key).
- Pontos de registro central a estender com o novo tipo (mesmo padrão que `PIE_CHART` já segue em
  cada um destes arquivos):
  - `packages/asturian-front/src/modules/page-layout/widgets/graph/components/GraphWidget.tsx`
    (switch que despacha pro renderer certo por `configurationType`)
  - `packages/asturian-front/src/modules/page-layout/utils/getWidgetTitle.ts`
  - `packages/asturian-front/src/modules/page-layout/utils/updateWidgetMinimumSizeForGraphType.ts`
    (ou arquivo equivalente de tamanho mínimo por tipo de gráfico)
  - O menu de "adicionar widget" (seletor de tipo de gráfico ao criar um widget novo) — localizar
    durante a implementação; precisa de um ícone/rótulo "Mapa" na lista.

## Fora de escopo

- Qualquer outro widget novo do mapeamento anterior (funil/Sankey, heatmap de calendário, gauge,
  scatter, treemap, badge de variação) — specs futuros.
- Configuração de operação de agregação no mapa (só contagem por enquanto).
- Pins por empresa individual usando `addressLat`/`addressLng` — o v1 é choropleth por país
  (`addressCountry`), não mapa de pontos. Pode virar uma iteração futura.
- `zyra-website` (landing page) — não tocado.

## Risco principal

Esta é a primeira vez que um novo `configurationType` de widget é adicionado desde que o sistema
foi construído (até onde mapeamos) — ou seja, a lista de "pontos de registro" acima foi montada
por grep/leitura de código, não por um checklist oficial do time. É provável que existam mais
lugares que fazem `switch`/`if` sobre os tipos de gráfico que não foram encontrados nesta
pesquisa. **O plano de implementação deve incluir uma tarefa de busca exaustiva por
`PIE_CHART`/`'PIE_CHART'` em todo o monorepo** antes de considerar o registro completo, e tratar
qualquer local novo encontrado como parte do mesmo padrão.

## Em aberto (não bloqueia o spec, mas o plano deve resolver)

- Exato componente/local do "menu de adicionar widget" onde o tipo de gráfico é escolhido —
  pesquisar durante o planejamento.
- Qual atlas TopoJSON usar exatamente e de onde empacotá-lo (pacote npm vs. asset local
  vendorizado).
- Forma exata da tabela de cores do choropleth (quantos degraus, se reaproveita a escala de
  accent nova da etapa 1 ou uma paleta sequencial própria) — decisão de design a tomar durante a
  implementação do renderer, usando o kit como referência visual.
