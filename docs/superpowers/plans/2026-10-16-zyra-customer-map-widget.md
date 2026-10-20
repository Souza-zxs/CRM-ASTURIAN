# Widget de mapa-múndi + dashboard "Clientes" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um novo tipo de widget de dashboard, `MAP_CHART` (mapa-múndi coroplético: países
coloridos por contagem de registros agrupados), seguindo ponta a ponta o mesmo padrão que o
`PIE_CHART` já usa (agrupar por campo, contar), e semear um dashboard padrão "Clientes" com esse
widget configurado pra contar empresas (`Company`) por `addressCountry`.

**Architecture:** `MAP_CHART` é um `WidgetConfigurationType` novo, irmão de `PIE_CHART`/`BAR_CHART`/
`LINE_CHART`/`AGGREGATE_CHART`, registrado em ~15 pontos no backend (enum, DTO, validação,
conversores de universal-identifier pra migração) e ~15 pontos no frontend (enum de UI `GraphType`,
mapeamentos de ícone/label, switch de renderer, hook de dados, assert, tamanho mínimo). O cálculo
("agrupar por campo, contar") é idêntico ao pie chart — só o desenho muda (país colorido em vez de
fatia). Renderização via `@nivo/geo` (`ResponsiveChoropleth`), dependência nova na mesma família
Nivo já usada (`@nivo/core`/`@nivo/line`/`@nivo/pie`/`@nivo/radial-bar`, todas `^0.99.0`). Nenhum
trabalho de mapa existe hoje no repo (confirmado por busca exaustiva) — inclui adicionar
`@nivo/geo` + `world-atlas` (atlas TopoJSON do mundo) + uma função nova de normalização de nome de
país (texto livre) pra ID de feature do TopoJSON, isolada e testável.

**Tech Stack:** NestJS + class-validator + GraphQL (`@nestjs/graphql`) no backend; React + Apollo
Client + `@nivo/geo` no frontend; TypeORM instance commands pra seed em workspaces existentes.

## Global Constraints

- Seguir o padrão do `PIE_CHART` em todo ponto de registro — não inventar um mecanismo paralelo.
- `MapChartConfiguration` mantém `aggregateFieldMetadataId`/`aggregateOperation` (mesma forma do
  `BaseChartConfiguration`) — a restrição "só contagem" é só UX no frontend (trava o valor em
  `COUNT`/campo `id`), nunca no schema/DTO. Isso é o que faz o tipo novo herdar de graça toda a
  validação genérica de referência de campo já existente.
- `groupByFieldMetadataId`/`groupBySubFieldName` ficam genéricos (qualquer campo, qualquer
  subcampo) — igual ao pie chart. O dashboard "Clientes" é só um *uso* desse mecanismo genérico
  (`Company.address` → subcampo `addressCountry`), não uma restrição no tipo do widget.
- **Nunca mude um identificador universal já commitado** (`STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS`)
  — UUIDs novos pro dashboard "Clientes" devem ser gerados uma vez e nunca trocados depois.
- **Nunca edite à mão o registro de instance commands** (`instance-commands.constant.ts`) — ele é
  atualizado automaticamente por `database:migrate:generate`.
- Sem tabela estilo grid genérico (Notion) em nenhuma parte da UI nova deste plano — seguir a
  linguagem visual de card/cor da etapa 1 do rebranding (`docs/superpowers/specs/2026-10-15-zyra-visual-rebrand-tokens-design.md`)
  onde houver qualquer elemento de lista (ex.: legenda do mapa).
- Rodar `npx nx lint:diff-with-main <pacote>` e `npx nx typecheck <pacote>` depois de cada tarefa,
  pra `zyra-shared`, `zyra-server` e `asturian-front` conforme o arquivo tocado. Depois de mudanças
  de schema GraphQL, rodar `npx nx run asturian-front:graphql:generate`.
- `zyra-website` não é tocado neste plano.

---

### Task 1: Tipo compartilhado + registro no backend (enum, DTO, validação)

**Files:**
- Modify: `packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type.ts`
- Create: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/dtos/map-chart-configuration.dto.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/validators/constants/valid-graph-configuration-types.constant.ts`
- Create: `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-map-chart-configuration.util.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-by-type.util.ts`
- Test: `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/utils/__tests__/validate-widget-configuration-input.util.spec.ts` (estender o existente com um caso `MAP_CHART`)

**Interfaces:**
- Produces: `WidgetConfigurationType.MAP_CHART` (novo membro de enum), `MapChartConfigurationDTO`
  (classe GraphQL `ObjectType('MapChartConfiguration')`), tipo `MapChartConfiguration` em
  `zyra-shared`. Tarefas seguintes (2-9) consomem esses três nomes exatamente como definidos aqui.

- [ ] **Step 1: Adicionar `MapChartConfiguration` em `zyra-shared`**

Em `packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts`, depois
do bloco `PieChartConfiguration` (linha ~39), adicionar:

```typescript
export type MapChartConfiguration = BaseChartConfiguration & {
  configurationType: 'MAP_CHART';
  groupByFieldMetadataId: SerializedRelation;
  groupBySubFieldName?: string;
  displayLegend?: boolean;
};
```

E incluir `| MapChartConfiguration` na union `PageLayoutWidgetConfiguration` (linha ~179, logo
depois de `| PieChartConfiguration`).

- [ ] **Step 2: Adicionar `MAP_CHART` em `GraphType`**

Em `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum.ts`,
adicionar `MAP_CHART = 'MAP_CHART',` ao enum `GraphType` (arquivo pequeno, ~14 linhas — mesma
posição relativa dos outros 4 valores).

- [ ] **Step 3: Adicionar `MAP_CHART` em `WidgetConfigurationType`**

Em `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type.ts`:
- Linha 9 (depois de `PIE_CHART = GraphType.PIE_CHART,`): adicionar `MAP_CHART = GraphType.MAP_CHART,`
- Linha 36 (dentro de `AllGraphWidgetConfigurationType`): adicionar `| WidgetConfigurationType.MAP_CHART`

A asserção de tipo em tempo de compilação no fim do arquivo (`Expect<...>`) vai falhar a build se
o passo 2 e este passo não ficarem em sincronia — é esperado que isso force consistência, não é um
erro a ignorar.

- [ ] **Step 4: Adicionar `MapChartConfigurationDTO`**

Criar `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/dtos/map-chart-configuration.dto.ts`,
espelhando `pie-chart-configuration.dto.ts` mas só com os campos que fazem sentido pra mapa (sem
`dateGranularity`, `orderBy`, `manualSortOrder`, `showCenterMetric`, `hideEmptyCategory`,
`splitMultiValueFields`, `displayDataLabel` — nenhum tem equivalente num coroplético):

```typescript
import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { CalendarStartDay } from 'zyra-shared/constants';
import {
  AggregateOperations,
  type ChartFilter,
  type MapChartConfiguration,
  SerializedRelation,
} from 'zyra-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('MapChartConfiguration')
export class MapChartConfigurationDTO implements MapChartConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.MAP_CHART])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.MAP_CHART;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: SerializedRelation;

  @Field(() => AggregateOperations)
  @IsNotEmpty()
  aggregateOperation: AggregateOperations;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  groupByFieldMetadataId: SerializedRelation;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  groupBySubFieldName?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  displayLegend?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  filter?: ChartFilter;

  @Field(() => String, { nullable: true, defaultValue: 'UTC' })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;

  @Field(() => Int, { nullable: true, defaultValue: CalendarStartDay.MONDAY })
  @IsOptional()
  @Min(0)
  @Max(7)
  firstDayOfTheWeek?: number;
}
```

(`@IsEnum(AggregateOperations)` foi trocado por `@IsNotEmpty()` simples de propósito — mantém a
validação de "não vazio" sem reintroduzir a escolha de operação na API pública; ajustar se o
code-review apontar que `@IsEnum` é preferível por consistência, mas documentar a decisão.)

- [ ] **Step 5: Registrar em `ChartReferencingFieldInConfiguration`**

Em `packages/zyra-server/src/engine/metadata-modules/page-layout-widget/types/chart-referencing-field-in-configuration.type.ts`,
adicionar `MapChartConfigurationDTO` à union (importar do novo DTO). Isso é o que faz
`aggregateFieldMetadataId` ser validado automaticamente pro tipo novo.

- [ ] **Step 6: Registrar no switch de validação de input**

Em `validate-widget-configuration-input.util.ts`, adicionar um `case` espelhando o de
`PIE_CHART`:
```typescript
case WidgetConfigurationType.MAP_CHART:
  errors = validateWidgetConfigurationByDto(MapChartConfigurationDTO, configuration);
  break;
```
(mais o import do novo DTO no topo do arquivo).

- [ ] **Step 7: Registrar no validador de referência de campo**

Em `validate-chart-configuration-field-references.util.ts`, adicionar um `case
WidgetConfigurationType.MAP_CHART:` com o mesmo corpo do `case WidgetConfigurationType.PIE_CHART:`
(valida `groupByFieldMetadataId`).

- [ ] **Step 8: Registrar nos validadores de configuração universal**

Em `valid-graph-configuration-types.constant.ts`, adicionar `WidgetConfigurationType.MAP_CHART` ao
array `VALID_GRAPH_CONFIGURATION_TYPES`.

Criar `validate-map-chart-configuration.util.ts` espelhando `validate-pie-chart-configuration.util.ts`
(mesma checagem: `groupByFieldMetadataUniversalIdentifier` definido).

Em `validate-graph-configuration-by-type.util.ts`, adicionar:
```typescript
case WidgetConfigurationType.MAP_CHART:
  return validateMapChartConfiguration(configuration, context);
```

- [ ] **Step 9: Teste de regressão**

Estender `validate-widget-configuration-input.util.spec.ts` com um `describe('MAP_CHART', ...)`
cobrindo: configuração válida passa sem erro; `groupByFieldMetadataId` ausente gera erro; mesmo
padrão dos testes existentes de `PIE_CHART` nesse arquivo (ler o arquivo primeiro pra copiar o
estilo exato).

- [ ] **Step 10: Rodar testes, lint, typecheck**

```bash
npx jest packages/zyra-server/src/engine/metadata-modules/page-layout-widget/utils/__tests__/validate-widget-configuration-input.util.spec.ts --config=packages/zyra-server/jest.config.mjs
npx nx lint:diff-with-main zyra-server
npx nx typecheck zyra-server
npx nx typecheck zyra-shared
```
Expected: tudo passa.

- [ ] **Step 11: Commit**

```bash
git add packages/zyra-shared/src/types/page-layout/page-layout-widget-configuration.type.ts packages/zyra-server/src/engine/metadata-modules/page-layout-widget packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/validators
git commit -m "feat(server): adiciona MAP_CHART como novo tipo de widget (schema+validacao)"
```

---

### Task 2: Conversores de universal-identifier (migração de workspace)

**Files:**
- Modify: `packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util.ts`
- Modify: `packages/zyra-server/src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util.ts`

**Interfaces:**
- Consumes: `WidgetConfigurationType.MAP_CHART`, `MapChartConfigurationDTO` (Task 1).
- Produces: nenhuma interface nova — só garante que configurações `MAP_CHART` sobrevivem a
  migrações de workspace (export/import de metadata) sem perder a referência aos campos.

- [ ] **Step 1: Registrar no conversor real→universal**

Em `from-page-layout-widget-configuration-to-universal-configuration.util.ts`, adicionar um `case
WidgetConfigurationType.MAP_CHART:` com o corpo **idêntico** ao `case
WidgetConfigurationType.PIE_CHART:` já existente (desestrutura `aggregateFieldMetadataId,
groupByFieldMetadataId, filter, ...rest`, resolve os dois pra identificador universal, retorna com
`filter` convertido).

- [ ] **Step 2: Registrar no conversor universal→real**

Em `from-universal-configuration-to-flat-page-layout-widget-configuration.util.ts`, mesma coisa:
`case WidgetConfigurationType.MAP_CHART:` com corpo idêntico ao de `PIE_CHART` (resolve
`aggregateFieldMetadataUniversalIdentifier`/`groupByFieldMetadataUniversalIdentifier` de volta pra
ids reais).

- [ ] **Step 3: Teste de regressão**

Se existir um arquivo de teste para qualquer um desses dois conversores (checar
`__tests__` ao lado de cada arquivo), estender com um caso `MAP_CHART` espelhando o de
`PIE_CHART`. Se não existir teste pra esses arquivos hoje, criar um teste mínimo pro conversor
real→universal cobrindo `MAP_CHART`: configuração com ids reais entra, identificadores universais
saem, nenhum campo perdido.

- [ ] **Step 4: Rodar testes, lint, typecheck**

```bash
npx nx test zyra-server -- --testPathPattern="universal-configuration"
npx nx lint:diff-with-main zyra-server
npx nx typecheck zyra-server
```

- [ ] **Step 5: Commit**

```bash
git add packages/zyra-server/src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util.ts packages/zyra-server/src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget
git commit -m "feat(server): registra MAP_CHART nos conversores de universal-identifier"
```

---

### Task 3: Serviço de agregação + GraphQL (`MapChartDataService`)

**Files:**
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/services/map-chart-data.service.ts`
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/services/__tests__/map-chart-data.service.spec.ts`
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/dtos/map-chart-data.dto.ts`
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/dtos/map-chart-data-item.dto.ts`
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/dtos/inputs/map-chart-data.input.ts`
- Create: `packages/zyra-server/src/modules/dashboard/chart-data/resolvers/map-chart-data.resolver.ts`

**Interfaces:**
- Consumes: `MapChartConfigurationDTO` (Task 1), `ChartDataQueryService.executeGroupByQuery` (já
  existe, usado por `PieChartDataService`), `WorkspaceManyOrAllFlatEntityMapsCacheService` (já
  existe).
- Produces: query GraphQL `mapChartData(input: MapChartDataInput!): MapChartDataDTO` retornando
  `{ data: { key: string, value: number }[] }` — consumida pela Task 5 (hook do frontend).

- [ ] **Step 1: Ler os arquivos-molde primeiro**

Antes de escrever código, ler na íntegra: `pie-chart-data.service.ts`, `pie-chart-data.input.ts`,
os DTOs `pie-chart-data.dto.ts`/`pie-chart-data-item.dto.ts`, e `pie-chart-data.resolver.ts` (todos
em `packages/zyra-server/src/modules/dashboard/chart-data/`). O serviço novo é uma versão mais
simples do de pizza: mesma chamada a `executeGroupByQuery`, mas **sem** a lógica de
`transformToPieChartData` (limite de fatias, ordenação, campos de métrica central) — só mapear
`rawResults` pra `{ key, value }[]` via o mesmo util `processOneDimensionalResults` que o pie chart
já usa.

- [ ] **Step 2: Escrever o teste primeiro (TDD)**

Criar `map-chart-data.service.spec.ts` espelhando exatamente o setup de mock de
`pie-chart-data.service.spec.ts` (mock de `WorkspaceManyOrAllFlatEntityMapsCacheService` e
`ChartDataQueryService.executeGroupByQuery` via `Test.createTestingModule`). Caso de teste mínimo:

```typescript
describe('getMapChartData', () => {
  it('transforms grouped results into map chart data points', async () => {
    mockExecuteGroupByQuery.mockResolvedValue([
      { groupByDimensionValues: ['Brazil'], aggregateValue: 12 },
      { groupByDimensionValues: ['United States'], aggregateValue: 7 },
    ]);

    const result = await service.getMapChartData({
      workspaceId,
      objectMetadataId,
      configuration: baseConfiguration as any,
      authContext: mockAuthContext,
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ key: 'Brazil', value: 12 });
    expect(result.data[1]).toEqual({ key: 'United States', value: 7 });
  });

  it('labels a null group-by bucket as "Not Set"', async () => {
    mockExecuteGroupByQuery.mockResolvedValue([
      { groupByDimensionValues: [null], aggregateValue: 3 },
    ]);

    const result = await service.getMapChartData({
      workspaceId,
      objectMetadataId,
      configuration: baseConfiguration as any,
      authContext: mockAuthContext,
    });

    expect(result.data[0].key).toBe('Not Set');
  });
});
```
(Adaptar `baseConfiguration`/mocks de metadata ao estilo exato já usado no arquivo de pizza — ler
primeiro, copiar o padrão de `mockGroupByField`/`flatObjectMetadataMaps` etc.)

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx jest packages/zyra-server/src/modules/dashboard/chart-data/services/__tests__/map-chart-data.service.spec.ts --config=packages/zyra-server/jest.config.mjs`
Expected: FAIL — `MapChartDataService` ainda não existe.

- [ ] **Step 4: Implementar `MapChartDataService`**

Criar `map-chart-data.service.ts` com um método público `getMapChartData({ workspaceId,
objectMetadataId, configuration, authContext })` que: resolve o campo de agrupamento via o mesmo
mecanismo de `PieChartDataService` (cache de flat entity maps), chama
`chartDataQueryService.executeGroupByQuery(...)`, e transforma o resultado em `{ data: { key,
value }[] }` usando `processOneDimensionalResults` (mesmo util que o pie chart importa — localizar
o import exato em `pie-chart-data.service.ts` e reaproveitar).

- [ ] **Step 5: Criar os DTOs e o input**

`map-chart-data-item.dto.ts` — `@ObjectType('MapChartDataItem')` com `key: string`, `value:
number` (espelha `pie-chart-data-item.dto.ts`).

`map-chart-data.dto.ts` — `@ObjectType('MapChartData')` com `data: MapChartDataItemDTO[]` (espelha
`pie-chart-data.dto.ts`, sem os campos `showLegend`/`showDataLabels`/`showCenterMetric`/
`hasTooManyGroups` que são específicos de pizza — manter só o que fizer sentido; se o frontend
precisar de `hasTooManyGroups` pra limitar quantos países aparecem, adicionar de volta — decidir
na Task 6 quando o renderer for escrito, e voltar aqui se precisar).

`map-chart-data.input.ts` — espelha `pie-chart-data.input.ts` byte a byte, trocando
`PieChartConfigurationDTO` por `MapChartConfigurationDTO`.

- [ ] **Step 6: Criar o resolver**

`map-chart-data.resolver.ts` espelhando `pie-chart-data.resolver.ts` — um `@Query(() =>
MapChartDataDTO)` chamado `mapChartData(@Args('input') input: MapChartDataInput)`, delegando pro
`MapChartDataService`. Registrar o resolver/serviço no módulo do dashboard (localizar o
`*.module.ts` que já registra `PieChartDataResolver`/`PieChartDataService` e adicionar os novos ao
lado).

- [ ] **Step 7: Rodar o teste de novo e confirmar que passa**

Run: `npx jest packages/zyra-server/src/modules/dashboard/chart-data/services/__tests__/map-chart-data.service.spec.ts --config=packages/zyra-server/jest.config.mjs`
Expected: PASS

- [ ] **Step 8: Lint e typecheck**

```bash
npx nx lint:diff-with-main zyra-server
npx nx typecheck zyra-server
```

- [ ] **Step 9: Commit**

```bash
git add packages/zyra-server/src/modules/dashboard/chart-data
git commit -m "feat(server): adiciona MapChartDataService e query GraphQL mapChartData"
```

---

### Task 4: Normalização de nome de país (frontend, isolada)

**Files:**
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/utils/normalizeCountryNameToIsoCode.ts`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/utils/__tests__/normalizeCountryNameToIsoCode.test.ts`

**Interfaces:**
- Consumes: nada — função pura.
- Produces: `normalizeCountryNameToIsoCode(rawCountryName: string): string | null` — recebe o
  texto livre que vem do campo `addressCountry` (ex.: `"Brazil"`, `"brasil"`, `"Brasil"`, `"BR"`,
  `"United States"`, `"USA"`) e devolve o código ISO 3166-1 alpha-3 usado pelos IDs de feature do
  atlas TopoJSON (`@nivo/geo`/`world-atlas` usam alpha-3, ex. `"BRA"`, `"USA"`), ou `null` se não
  reconhecer. Consumida pela Task 5 (hook de dados) e pela Task 6 (renderer).

**Por que isolado**: é a única parte desta feature sem precedente no código (busca exaustiva
confirmou: nenhum mapeamento de nome-de-país existe hoje no repo). `addressCountry` é texto livre
digitado pelo usuário, não um código controlado — então essa função é o único lugar onde
"heurística de melhor esforço" é aceitável; todo o resto do plano é mecânico.

- [ ] **Step 1: Escrever os testes primeiro (TDD)**

```typescript
import { normalizeCountryNameToIsoCode } from '../normalizeCountryNameToIsoCode';

describe('normalizeCountryNameToIsoCode', () => {
  it('matches the English country name case-insensitively', () => {
    expect(normalizeCountryNameToIsoCode('Brazil')).toBe('BRA');
    expect(normalizeCountryNameToIsoCode('brazil')).toBe('BRA');
  });

  it('matches common Portuguese names', () => {
    expect(normalizeCountryNameToIsoCode('Brasil')).toBe('BRA');
    expect(normalizeCountryNameToIsoCode('Estados Unidos')).toBe('USA');
  });

  it('matches ISO alpha-2 and alpha-3 codes directly', () => {
    expect(normalizeCountryNameToIsoCode('BR')).toBe('BRA');
    expect(normalizeCountryNameToIsoCode('USA')).toBe('USA');
  });

  it('trims whitespace before matching', () => {
    expect(normalizeCountryNameToIsoCode('  Brazil  ')).toBe('BRA');
  });

  it('returns null for unrecognized input', () => {
    expect(normalizeCountryNameToIsoCode('Not A Real Country')).toBeNull();
    expect(normalizeCountryNameToIsoCode('')).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx jest packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/utils/__tests__/normalizeCountryNameToIsoCode.test.ts --config=packages/asturian-front/jest.config.mjs`
Expected: FAIL — o arquivo ainda não existe.

- [ ] **Step 3: Implementar**

Criar `normalizeCountryNameToIsoCode.ts` com um mapa estático `Record<string, string>` de chave
normalizada (minúscula, sem acento, trim) → código alpha-3, cobrindo pelo menos: todos os países
de língua portuguesa e os ~40 países mais comuns em bases de clientes B2B (América do Norte,
Europa Ocidental, América Latina, principais economias da Ásia) em inglês E português, mais os
próprios códigos alpha-2/alpha-3 como chaves (pra aceitar entrada já normalizada). Usar
`String.prototype.normalize('NFD').replace(/[̀-ͯ]/g, '')` pra remover acento antes de
comparar. Retornar `null` pra qualquer coisa fora do mapa — **não tentar fuzzy-match/distância de
edição nesta primeira versão** (escopo do spec: v1 é melhor esforço, não cobertura total).

- [ ] **Step 4: Rodar os testes de novo e confirmar que passam**

Run: mesmo comando do Step 2.
Expected: PASS

- [ ] **Step 5: Lint e typecheck**

```bash
npx nx lint:diff-with-main asturian-front
npx nx typecheck asturian-front
```

- [ ] **Step 6: Commit**

```bash
git add packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/utils
git commit -m "feat(front): normalizacao de nome de pais para codigo ISO alpha-3"
```

---

### Task 5: Query GraphQL + hook de dados (frontend)

**Files:**
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graphql/queries/mapChartData.ts`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/hooks/useGraphMapChartWidgetData.ts`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/utils/assertMapChartWidget.ts`
- Test: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/hooks/__tests__/useGraphMapChartWidgetData.test.ts`

**Interfaces:**
- Consumes: `normalizeCountryNameToIsoCode` (Task 4), query GraphQL `mapChartData` (Task 3, exposta
  depois do `graphql:generate` do Step 1 abaixo).
- Produces: `useGraphMapChartWidgetData({ objectMetadataItemId, configuration }): { data: {
  isoCode: string; countryLabel: string; value: number }[], loading: boolean, error?: Error }` —
  consumida pela Task 6 (renderer). `assertMapChartWidgetOrThrow(widget)` — consumida pela Task 6.

- [ ] **Step 1: Rodar o codegen do GraphQL**

Com o backend da Task 3 já commitado (precisa do schema atualizado disponível — rodar o server
localmente ou usar o schema já versionado, conforme o fluxo normal do projeto):
```bash
npx nx run asturian-front:graphql:generate
```
Expected: `~/generated-metadata/graphql` passa a exportar `MapChartDataDocument`,
`MapChartConfiguration`, `WidgetConfigurationType.MAP_CHART`.

- [ ] **Step 2: Criar a query GraphQL**

`mapChartData.ts`, espelhando `pieChartData.ts`:
```typescript
import { gql } from '@apollo/client';

export const MAP_CHART_DATA = gql`
  query MapChartData($input: MapChartDataInput!) {
    mapChartData(input: $input) {
      data {
        key
        value
      }
    }
  }
`;
```

- [ ] **Step 3: Criar `assertMapChartWidgetOrThrow`**

Espelhando `assertPieChartWidget.ts` byte a byte, trocando `PieChartConfiguration` por
`MapChartConfiguration` e `'PieChartConfiguration'` por `'MapChartConfiguration'`.

- [ ] **Step 4: Escrever o teste do hook primeiro (TDD)**

Seguir o padrão de teste já usado para o hook de pizza (localizar
`graph-widget-pie-chart/hooks/__tests__/` pra copiar o estilo de mock do Apollo
`MockedProvider`/`useQuery`). Caso mínimo: dado um resultado mockado de `mapChartData` com `{ key:
'Brazil', value: 12 }`, o hook retorna `data` contendo `{ isoCode: 'BRA', countryLabel: 'Brazil',
value: 12 }`; dado um `key` não reconhecido pela normalização, o item é omitido do resultado (não
quebra o mapa, só não pinta aquele país).

- [ ] **Step 5: Implementar o hook**

`useGraphMapChartWidgetData.ts`, mais simples que `useGraphPieChartWidgetData.ts` (sem a ramificação
de cor-por-opção-de-select, já que o campo de agrupamento de um mapa não é um SELECT): chama
`useQuery(MapChartDataDocument, { variables: { input: { objectMetadataId: objectMetadataItemId,
configuration } } })`, mapeia `queryData.mapChartData.data` aplicando
`normalizeCountryNameToIsoCode(item.key)`, descarta itens com `isoCode === null`, retorna `{ data,
loading, error }`.

- [ ] **Step 6: Rodar o teste e confirmar que passa**

```bash
npx jest packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/hooks/__tests__/useGraphMapChartWidgetData.test.ts --config=packages/asturian-front/jest.config.mjs
```

- [ ] **Step 7: Lint e typecheck**

```bash
npx nx lint:diff-with-main asturian-front
npx nx typecheck asturian-front
```

- [ ] **Step 8: Commit**

```bash
git add packages/asturian-front/src/modules/page-layout/widgets/graph/graphql/queries/mapChartData.ts packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/hooks packages/asturian-front/src/modules/page-layout/widgets/graph/utils/assertMapChartWidget.ts
git commit -m "feat(front): query GraphQL e hook de dados do widget de mapa"
```

---

### Task 6: Componentes de renderização (`@nivo/geo`)

**Files:**
- Modify: `packages/asturian-front/package.json` (adicionar `@nivo/geo` e `world-atlas`)
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/components/GraphWidgetMapChart.tsx`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/components/GraphWidgetMapChartRenderer.tsx`
- Create: `packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/components/__stories__/GraphWidgetMapChart.stories.tsx`
- Modify: `packages/asturian-front/src/modules/page-layout/widgets/graph/components/GraphWidget.tsx`

**Interfaces:**
- Consumes: `useGraphMapChartWidgetData` (Task 5), `assertMapChartWidgetOrThrow` (Task 5),
  `WidgetConfigurationType.MAP_CHART` (Task 1 via codegen).
- Produces: `<GraphWidgetMapChartRenderer />` — consumido pela Task 7 (switch de `GraphWidget.tsx`,
  já modificado aqui mesmo).

- [ ] **Step 1: Instalar as dependências**

```bash
cd packages/asturian-front && npm install @nivo/geo@^0.99.0 world-atlas
```
Confirmar no `package.json` que `@nivo/geo` ficou na mesma faixa de versão `^0.99.0` das outras
libs Nivo já usadas, pra evitar incompatibilidade de `@nivo/core` entre pacotes.

- [ ] **Step 2: Criar o componente presentacional `GraphWidgetMapChart`**

Usa `ResponsiveChoropleth` de `@nivo/geo`, alimentado pelo atlas `world-atlas/countries-110m.json`
(importar via o pacote instalado — checar no README do `world-atlas` ou no `node_modules` o
caminho exato de import do JSON/TopoJSON pós-instalação). Props: `data: { isoCode: string;
countryLabel: string; value: number }[]`, `displayLegend?: boolean`.

Estrutura mínima (adaptar escala de cor pra usar os tokens de accent da etapa 1 — ver
`themeCssVariables.accent.*`, especificamente uma escala sequencial do `accent3`/`accent5` claro
até o `accent9`/`accent10` vívido, em vez de uma paleta genérica do Nivo):
```tsx
import { ResponsiveChoropleth } from '@nivo/geo';
import { useContext } from 'react';
import { ThemeContext } from 'zyra-ui/theme-constants';
import worldCountries from 'world-atlas/countries-110m.json';

type GraphWidgetMapChartProps = {
  data: { isoCode: string; countryLabel: string; value: number }[];
  displayLegend?: boolean;
};

export const GraphWidgetMapChart = ({
  data,
  displayLegend = true,
}: GraphWidgetMapChartProps) => {
  const { theme } = useContext(ThemeContext);

  const choroplethData = data.map((item) => ({
    id: item.isoCode,
    value: item.value,
  }));

  return (
    <ResponsiveChoropleth
      data={choroplethData}
      features={worldCountries.objects.countries as never}
      domain={[0, Math.max(...data.map((item) => item.value), 1)]}
      colors={[
        theme.accent.accent3,
        theme.accent.accent5,
        theme.accent.accent7,
        theme.accent.accent9,
        theme.accent.accent10,
      ]}
      unknownColor={theme.background.tertiary}
      label="properties.name"
      valueFormat=".0f"
      projectionScale={110}
      projectionTranslation={[0.5, 0.55]}
      borderWidth={0.5}
      borderColor={theme.border.color.light}
      legends={
        displayLegend
          ? [
              {
                anchor: 'bottom-left',
                direction: 'column',
                translateY: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemsSpacing: 0,
                symbolSize: 10,
              },
            ]
          : []
      }
    />
  );
};
```
(`features={worldCountries.objects.countries as never}` é um placeholder de tipo — `@nivo/geo`
espera geometria GeoJSON `Feature[]`, enquanto `world-atlas` entrega TopoJSON cru; checar durante a
implementação se é preciso converter com `topojson-client`'s `feature()` antes de passar pro
componente — se sim, adicionar `topojson-client` como dependência também e ajustar este passo.)

- [ ] **Step 3: Criar o wrapper `GraphWidgetMapChartRenderer`**

Espelhando `GraphWidgetPieChartRenderer.tsx`: `assertMapChartWidgetOrThrow(widget)` →
`useGraphMapChartWidgetData(...)` → `lazy(() => import('./GraphWidgetMapChart'))` → estados de
loading/erro (`WidgetSkeletonLoader`, `PageLayoutWidgetErrorDisplay`) → renderiza o componente
presentacional passando `data` e `displayLegend={widget.configuration.displayLegend}`. **Sem**
drill-down por clique nesta primeira versão (o clique num país abrindo uma lista filtrada de
registros é uma extensão natural, mas fica pra depois — não bloqueia este plano).

- [ ] **Step 4: Registrar no switch de `GraphWidget.tsx`**

Adicionar:
```tsx
case WidgetConfigurationType.MAP_CHART:
  return <GraphWidgetMapChartRenderer />;
```
(mais o import no topo do arquivo).

- [ ] **Step 5: Story do Storybook**

Criar `GraphWidgetMapChart.stories.tsx` espelhando `GraphWidgetPieChart.stories.tsx` (mesmo padrão
de dados mock, mas com `isoCode`/`countryLabel`/`value`) — serve como verificação visual rápida sem
precisar do backend rodando, dado que o Storybook de `asturian-front` já importa
`theme-light.css`/`theme-dark.css` (ver `.storybook/preview.tsx`).

- [ ] **Step 6: Typecheck e lint**

```bash
npx nx lint:diff-with-main asturian-front
npx nx typecheck asturian-front
```
Expected: sem erros novos. Prestar atenção especial em erros de tipo entre a geometria do
`world-atlas` e o que `@nivo/geo` espera (ver nota do Step 2) — resolver aqui, não deixar `as any`.

- [ ] **Step 7: Commit**

```bash
git add packages/asturian-front/package.json packages/asturian-front/package-lock.json packages/asturian-front/src/modules/page-layout/widgets/graph/graph-widget-map-chart/components packages/asturian-front/src/modules/page-layout/widgets/graph/components/GraphWidget.tsx
git commit -m "feat(front): renderer do widget de mapa com @nivo/geo"
```

---

### Task 7: Tornar o tipo "Mapa" selecionável na UI de criação de widget

**Files:**
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/types/GraphType.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/constants/GraphTypeInformation.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/components/ChartTypeSelectionSection.tsx`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/constants/GraphConfigurationTypeToConfigTypename.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph.ts`
- Modify: `packages/asturian-front/src/modules/side-panel/pages/page-layout/hooks/useUpdateGraphTypeConfig.ts`
- Modify: `packages/asturian-front/src/modules/page-layout/utils/getWidgetTitle.ts`
- Modify: `packages/asturian-front/src/modules/page-layout/constants/GraphWidgetSizes.ts`
- Test: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/__tests__/getConfigurationTypeFromGraphType.test.ts` (estender)
- Test: `packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/__tests__/getCurrentGraphTypeFromConfig.test.ts` (estender)

**Interfaces:**
- Consumes: `GraphWidgetMapChartRenderer` (Task 6), `WidgetConfigurationType.MAP_CHART` (Task 1).
- Produces: `GraphType.MAP` — seletável na UI de criação/edição de widget, mapeado de/para
  `WidgetConfigurationType.MAP_CHART`.

- [ ] **Step 1: Adicionar `GraphType.MAP`**

Em `GraphType.ts`:
```typescript
export enum GraphType {
  VERTICAL_BAR = 'VERTICAL_BAR',
  HORIZONTAL_BAR = 'HORIZONTAL_BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  AGGREGATE = 'AGGREGATE',
  MAP = 'MAP',
}
```

- [ ] **Step 2: Registrar label e ícone**

Em `GraphTypeInformation.ts`, adicionar ao `GRAPH_TYPE_INFORMATION`:
```typescript
[GraphType.MAP]: {
  label: msg`Map Chart`,
  icon: IconMap, // confirmar o nome exato do ícone disponível em zyra-ui/icon (buscar "IconMap"/"IconWorld" no pacote — usar o que existir; se nenhum existir, usar IconWorld como fallback razoável)
  settings: MAP_CHART_SETTINGS, // ver Step 3
},
```
Criar `MAP_CHART_SETTINGS` (mesmo arquivo ou um `getMapChartSettings.ts` sibling, seguindo o
padrão de `PIE_CHART_SETTINGS`/`getBarChartSettings`) — settings mínimos: seletor de objeto, campo
de agrupamento (`groupByFieldMetadataId`/`groupBySubFieldName`), toggle de legenda
(`displayLegend`). **Sem** seletor de operação de agregação (fica travado em COUNT — ver Step 6).

- [ ] **Step 3: Adicionar à lista de opções visíveis**

Em `ChartTypeSelectionSection.tsx`, adicionar `GraphType.MAP` ao array `graphTypeOptions`.

- [ ] **Step 4: Mapeamentos de tipo**

Em `getConfigurationTypeFromGraphType.ts`: adicionar `case GraphType.MAP: return
WidgetConfigurationType.MAP_CHART;`.

Em `getCurrentGraphTypeFromConfig.ts`: adicionar o branch inverso (`MapChartConfiguration` →
`GraphType.MAP`).

Em `GraphConfigurationTypeToConfigTypename.ts`: adicionar `[WidgetConfigurationType.MAP_CHART]:
'MapChartConfiguration',`.

Em `isWidgetConfigurationOfType.ts`: adicionar `MapChartConfiguration` ao
`WidgetConfigurationTypenameMap`.

Em `isWidgetConfigurationOfTypeGraph.ts`: adicionar `|| isWidgetConfigurationOfType(configuration,
'MapChartConfiguration')`.

- [ ] **Step 5: `getWidgetTitle.ts`**

Adicionar, antes do `default:`:
```typescript
case WidgetConfigurationType.MAP_CHART:
  return `${t`Map Chart`} ${index + 1}`;
```
(Sem isso o arquivo não compila mais — o `assertUnreachable` no `default` força essa adição assim
que `WidgetConfigurationType.MAP_CHART` existir no schema gerado.)

- [ ] **Step 6: Tamanho mínimo + exclusão da conversão bar/line/pie**

Em `GraphWidgetSizes.ts`, adicionar:
```typescript
[WidgetConfigurationType.MAP_CHART]: { default: { w: 6, h: 6 }, minimum: { w: 4, h: 4 } },
```

Em `useUpdateGraphTypeConfig.ts`: ler o arquivo, localizar o trecho que já exclui `GraphType.AGGREGATE`
das conversões específicas de pizza/barra/linha (procurar por `GraphType.AGGREGATE` no arquivo —
é o mesmo padrão de "este tipo não participa da conversão bar↔line↔pie"). Adicionar
`GraphType.MAP` à mesma exclusão, e garantir que ao trocar PARA `GraphType.MAP`, o
`aggregateFieldMetadataId` é setado automaticamente pro campo `id` do objeto corrente e
`aggregateOperation` pra `AggregateOperations.COUNT` (mesma convenção usada em todo o resto do
código pra "contar registros" — confirmada em `compute-my-first-dashboard-widgets.util.ts`).

- [ ] **Step 7: Testes de regressão**

Estender `getConfigurationTypeFromGraphType.test.ts` e `getCurrentGraphTypeFromConfig.test.ts` com
um caso `GraphType.MAP`/`WidgetConfigurationType.MAP_CHART` cada, seguindo o padrão exato dos
casos existentes nesses arquivos (ler primeiro).

- [ ] **Step 8: Rodar testes, lint, typecheck**

```bash
npx jest packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/__tests__/getConfigurationTypeFromGraphType.test.ts packages/asturian-front/src/modules/side-panel/pages/page-layout/utils/__tests__/getCurrentGraphTypeFromConfig.test.ts --config=packages/asturian-front/jest.config.mjs
npx nx lint:diff-with-main asturian-front
npx nx typecheck asturian-front
```

- [ ] **Step 9: Commit**

```bash
git add packages/asturian-front/src/modules/side-panel/pages/page-layout packages/asturian-front/src/modules/page-layout/utils/getWidgetTitle.ts packages/asturian-front/src/modules/page-layout/constants/GraphWidgetSizes.ts
git commit -m "feat(front): torna Mapa selecionavel na UI de criacao de widget"
```

---

### Task 8: Seed do dashboard "Clientes" (workspaces novos)

**Files:**
- Modify: `packages/zyra-shared/src/metadata/constants/standard-page-layout-universal-identifiers.constant.ts`
- Create: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/utils/page-layout-config/standard-clientes-page-layout.config.ts`
- Create: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/utils/page-layout-widget/compute-clientes-dashboard-widgets.util.ts`
- Modify: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/constants/standard-page-layout.constant.ts`

**Interfaces:**
- Consumes: `WidgetConfigurationType.MAP_CHART` (Task 1), o padrão de referência de campo por
  `args.standardObjectMetadataRelatedEntityIds.company.fields.*`/`STANDARD_OBJECTS.company.fields.*`
  já usado em `compute-my-first-dashboard-widgets.util.ts`.
- Produces: `STANDARD_CLIENTES_PAGE_LAYOUT_CONFIG` — consumido pela Task 9 (instance command, que
  precisa da mesma lógica de construção pra aplicar em workspaces já existentes).

- [ ] **Step 1: Gerar UUIDs novos e adicionar os identificadores universais**

Gerar UUIDs novos (ex.: `node -e "console.log(crypto.randomUUID())"` várias vezes) e adicionar em
`standard-page-layout-universal-identifiers.constant.ts`, como uma nova chave de topo irmã de
`myFirstDashboard`:
```typescript
clientesDashboard: {
  universalIdentifier: '<uuid-novo-1>',
  tabs: {
    tab1: {
      universalIdentifier: '<uuid-novo-2>',
      widgets: {
        customersByCountryMap: { universalIdentifier: '<uuid-novo-3>' },
      },
    },
  },
},
```
**Nunca reutilizar um UUID já existente no arquivo, e nunca mudar um que já estava lá.**

- [ ] **Step 2: Criar o construtor de widgets do dashboard "Clientes"**

Em `compute-clientes-dashboard-widgets.util.ts`, seguir exatamente o padrão de
`createDealsByCompany` (em `compute-my-first-dashboard-widgets.util.ts` — ler primeiro) pra criar
um builder `createCustomersByCountryMap` que monta um widget `MAP_CHART` com:
- `objectMetadataUniversalIdentifier`: `STANDARD_OBJECTS.company.universalIdentifier`
- `groupByFieldMetadataId`: `args.standardObjectMetadataRelatedEntityIds.company.fields.address.id`
- `groupBySubFieldName`: `'addressCountry'`
- `aggregateFieldMetadataId`: `args.standardObjectMetadataRelatedEntityIds.company.fields.id.id`
- `aggregateOperation`: `AggregateOperations.COUNT`
- `universalIdentifier`: o novo `STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.clientesDashboard.tabs.tab1.widgets.customersByCountryMap.universalIdentifier`

Exportar uma função `computeClientesDashboardWidgets(args)` retornando um array com esse único
widget (deixa espaço pra adicionar mais widgets depois sem reestruturar).

- [ ] **Step 3: Criar a config do page layout**

Em `standard-clientes-page-layout.config.ts`, espelhar `standard-dashboard-page-layout.config.ts`:
```typescript
export const STANDARD_CLIENTES_PAGE_LAYOUT_CONFIG = {
  name: 'Clientes',
  type: PageLayoutType.DASHBOARD,
  objectUniversalIdentifier: null,
  universalIdentifier: STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.clientesDashboard.universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: {
    tab1: {
      universalIdentifier: STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.clientesDashboard.tabs.tab1.universalIdentifier,
      // widgets montados via computeClientesDashboardWidgets no momento da aplicação —
      // seguir o mesmo padrão de composição que STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG usa
      // (ler o arquivo-molde pra replicar exatamente como widgets entram no objeto tabs)
    },
  },
} as const satisfies StandardPageLayoutConfig;
```

- [ ] **Step 4: Registrar no catálogo + resolver o vazamento pra `STANDARD_RECORD_PAGE_LAYOUTS`**

Em `standard-page-layout.constant.ts`: adicionar `clientesDashboard: STANDARD_CLIENTES_PAGE_LAYOUT_CONFIG,`
ao objeto `STANDARD_PAGE_LAYOUTS`.

Trocar a desestruturação por chave (`const { myFirstDashboard: _myFirstDashboard, ...recordPageLayouts }
= STANDARD_PAGE_LAYOUTS`) por um filtro pelo campo `type`, que escala pra qualquer número de
dashboards futuros sem precisar lembrar de excluir cada chave nova à mão:
```typescript
export const STANDARD_RECORD_PAGE_LAYOUTS = Object.fromEntries(
  Object.entries(STANDARD_PAGE_LAYOUTS).filter(
    ([, config]) => config.type !== PageLayoutType.DASHBOARD,
  ),
) satisfies StandardRecordPageLayouts;
```
Confirmar que `STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG` (my first dashboard) já declara `type:
PageLayoutType.DASHBOARD` explicitamente (já confirmado em pesquisa) — e que a nova
`STANDARD_CLIENTES_PAGE_LAYOUT_CONFIG` do Step 3 também declara.

- [ ] **Step 5: Teste manual local**

Rodar `npx nx run zyra-server:database:init` (ou `:migrate` se já inicializado) num banco de
desenvolvimento limpo e confirmar via o MCP Postgres read-only (ver CLAUDE.md) que um novo
workspace criado do zero já vem com um dashboard "Clientes" contendo o widget de mapa.

- [ ] **Step 6: Lint e typecheck**

```bash
npx nx lint:diff-with-main zyra-server
npx nx lint:diff-with-main zyra-shared
npx nx typecheck zyra-server
npx nx typecheck zyra-shared
```

- [ ] **Step 7: Commit**

```bash
git add packages/zyra-shared/src/metadata/constants/standard-page-layout-universal-identifiers.constant.ts packages/zyra-server/src/engine/workspace-manager/zyra-standard-application
git commit -m "feat(server): semeia dashboard Clientes com widget de mapa para workspaces novos"
```

---

### Task 9: Instance command (workspaces já existentes)

**Files:**
- Create: um novo arquivo em `packages/zyra-server/src/database/commands/upgrade-version-command/<pasta-da-versao-atual>/` (nome gerado pelo comando abaixo)

**Interfaces:**
- Consumes: `computeClientesDashboardWidgets`/`STANDARD_CLIENTES_PAGE_LAYOUT_CONFIG` (Task 8) — a
  lógica de criação deve ser reaproveitada, não duplicada.

- [ ] **Step 1: Descobrir a versão atual e gerar o comando**

Checar a versão atual do produto (buscar `@RegisteredInstanceCommand` mais recente em
`packages/zyra-server/src/database/commands/upgrade-version-command/` pra saber qual pasta de
versão usar, ou criar uma nova se a versão mudou desde o último comando).

```bash
npx nx run zyra-server:database:migrate:generate --name create-clientes-dashboard --type slow
```

- [ ] **Step 2: Implementar `runDataMigration`**

Seguir a forma do exemplo real já localizado (`2-16-instance-command-slow-...` em
`upgrade-version-command/2-16/`) — ler esse arquivo primeiro pra copiar o padrão de iteração sobre
workspaces. No `runDataMigration(dataSource)`: iterar sobre todos os workspaces ativos, e para cada
um que **ainda não tem** um page layout com `universalIdentifier ===
STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.clientesDashboard.universalIdentifier`, criar o
dashboard "Clientes" com o widget de mapa — reaproveitando a mesma lógica de construção da Task 8
(extrair `computeClientesDashboardWidgets`/a config do page layout pra uma função compartilhada
que tanto o seed de workspace novo quanto este instance command chamam, em vez de duplicar o
código).

- [ ] **Step 3: Implementar `up`/`down`**

`up`: no-op ou validação leve (a criação real acontece em `runDataMigration`, que roda antes —
confirmar esse comportamento lendo `UPGRADE_COMMANDS.md` de novo se houver dúvida sobre a ordem).
`down`: remove o page layout com esse `universalIdentifier` de todo workspace, se existir.

- [ ] **Step 4: Teste de integração**

Seguir o padrão de teste de instance commands existente (buscar um `.spec.ts` ao lado de um
comando real já commitado pra copiar a estrutura) — criar um teste cobrindo: workspace sem o
dashboard recebe ele após `runDataMigration`; workspace que já tem (idempotência) não duplica.

- [ ] **Step 5: Rodar o teste, lint, typecheck**

```bash
npx nx run zyra-server:test:integration:with-db-reset -- --testPathPattern="create-clientes-dashboard"
npx nx lint:diff-with-main zyra-server
npx nx typecheck zyra-server
```

- [ ] **Step 6: Commit**

```bash
git add packages/zyra-server/src/database/commands/upgrade-version-command
git commit -m "feat(server): instance command para criar dashboard Clientes em workspaces existentes"
```

---

### Task 10: Codegen final, verificação ponta a ponta e busca de pontos esquecidos

**Files:** nenhum arquivo de produto — tarefa de verificação.

- [ ] **Step 1: Codegen completo**

```bash
npx nx run asturian-front:graphql:generate
npx nx run asturian-front:graphql:generate --configuration=metadata
```
Confirmar que não sobrou nenhuma referência quebrada a tipos antigos.

- [ ] **Step 2: Busca exaustiva de pontos esquecidos (mitigação do risco registrado no spec)**

```bash
grep -rn "PIE_CHART" packages/ --include="*.ts" --include="*.tsx" -l
```
Para cada arquivo retornado que **não** foi tocado em nenhuma das Tasks 1-9, abrir e avaliar se
precisa de um `MAP_CHART` equivalente (ex.: a camada de ferramentas de IA —
`src/modules/dashboard/tools/schemas/widget.schema.ts`, `get-dashboard.tool.ts`,
`create-complete-dashboard.tool.ts`, `create-standard-flat-skill-metadata.util.ts` — flagados na
pesquisa como "provavelmente precisam, prioridade mais baixa"). Se algum ponto genuinamente
precisar de mudança pra não quebrar/ficar inconsistente, criar uma sub-tarefa e resolver aqui. Se
for só "a IA não vai conseguir criar widget de mapa ainda" (uma lacuna de funcionalidade, não um
bug), documentar como limitação conhecida no commit/relatório final, não bloquear.

- [ ] **Step 3: Typecheck e lint completos dos três pacotes**

```bash
npx nx typecheck zyra-shared && npx nx typecheck zyra-server && npx nx typecheck asturian-front
npx nx lint:diff-with-main zyra-shared && npx nx lint:diff-with-main zyra-server && npx nx lint:diff-with-main asturian-front
```

- [ ] **Step 4: Verificação visual**

Igual ao que foi feito (ou tentado) na etapa 1: subir o ambiente de dev, criar/abrir o dashboard
"Clientes", confirmar que o mapa aparece, com pelo menos uma empresa de teste tendo
`addressCountry` preenchido, e que o país correspondente aparece colorido. Testar claro e escuro.
Se o ambiente não permitir (mesma limitação de Postgres/Docker da etapa 1), registrar isso
explicitamente e marcar como pendência pro usuário verificar depois de puxar a branch.

- [ ] **Step 5: Commit final (se houver qualquer ajuste dos Steps 1-2)**

```bash
git add -A
git commit -m "chore: codegen final e correcoes de pontos de registro encontrados na busca exaustiva"
```
(Pular este commit se nada mudou nos Steps 1-2.)
