import { CalendarStartDay } from 'zyra-shared/constants';
import { STANDARD_OBJECTS } from 'zyra-shared/metadata';
import {
  AggregateOperations,
  PageLayoutTabLayoutMode,
} from 'zyra-shared/types';
import { v4 } from 'uuid';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  type CreateStandardPageLayoutWidgetArgs,
  createStandardPageLayoutWidgetFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/page-layout-widget/create-standard-page-layout-widget-flat-metadata.util';

type DashboardWidgetBuilderArgs = Omit<
  CreateStandardPageLayoutWidgetArgs,
  'context'
>;

const createFilterConfigs = (
  filters: Array<{
    type: string;
    label: string;
    value: string;
    displayValue: string;
    operand: string;
    fieldMetadataId: string;
    fieldMetadataUniversalIdentifier: string;
  }>,
) => {
  const groupId = v4();

  const recordFilterGroups = [
    {
      id: groupId,
      logicalOperator: 'AND',
    },
  ];

  return {
    configuration: {
      recordFilters: filters.map((filter) => ({
        type: filter.type,
        label: filter.label,
        value: filter.value,
        displayValue: filter.displayValue,
        operand: filter.operand,
        fieldMetadataId: filter.fieldMetadataId,
        recordFilterGroupId: groupId,
      })),
      recordFilterGroups,
    },
    universal: {
      recordFilters: filters.map((filter) => ({
        type: filter.type,
        label: filter.label,
        value: filter.value,
        displayValue: filter.displayValue,
        operand: filter.operand,
        fieldMetadataUniversalIdentifier:
          filter.fieldMetadataUniversalIdentifier,
        recordFilterGroupId: groupId,
      })),
      recordFilterGroups,
    },
  };
};

const createPipelineValueByStage = ({
  args,
}: {
  args: DashboardWidgetBuilderArgs;
}): FlatPageLayoutWidget => {
  const opportunityFields =
    args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
  const opportunityObjectId =
    args.standardObjectMetadataRelatedEntityIds.opportunity.id;

  return createStandardPageLayoutWidgetFlatMetadata({
    ...args,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.universalIdentifier,
    context: {
      layoutName: 'myFirstDashboard',
      tabTitle: 'tab1',
      widgetName: 'pipelineValueByStage',
      title: 'Funil por etapa',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 0, rowSpan: 6, columnSpan: 8 },
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 2,
        column: 0,
        rowSpan: 6,
        columnSpan: 8,
      },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityFields.stage.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
        secondaryAxisGroupByFieldMetadataId: opportunityFields.company.id,
        secondaryAxisGroupBySubFieldName: 'name',
        secondaryAxisGroupByDateGranularity:
          ObjectRecordGroupByDateGranularity.DAY,
        secondaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'green',
        layout: BarChartLayout.VERTICAL,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      universalConfiguration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.opportunity.fields.amount.universalIdentifier,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
        secondaryAxisGroupByFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.opportunity.fields.company.universalIdentifier,
        secondaryAxisGroupBySubFieldName: 'name',
        secondaryAxisGroupByDateGranularity:
          ObjectRecordGroupByDateGranularity.DAY,
        secondaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'green',
        layout: BarChartLayout.VERTICAL,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
    },
  });
};

const DASHBOARD_TIMEZONE = 'America/Sao_Paulo';

type FilterInput = Parameters<typeof createFilterConfigs>[0][number];

const buildRelativeDateFilter = ({
  label,
  relativeValue,
  fieldMetadataId,
  fieldMetadataUniversalIdentifier,
}: {
  label: string;
  relativeValue: string;
  fieldMetadataId: string;
  fieldMetadataUniversalIdentifier: string;
}): FilterInput => {
  const value = `${relativeValue};;${DASHBOARD_TIMEZONE};;SUNDAY;;`;

  return {
    type: 'DATE_TIME',
    label,
    value,
    displayValue: value,
    operand: 'IS_RELATIVE',
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
  };
};

type KpiWidgetParams = {
  args: DashboardWidgetBuilderArgs;
  widgetName: string;
  title: string;
  column: number;
  objectMetadataUniversalIdentifier: string;
  objectMetadataId: string;
  aggregateFieldMetadataId: string;
  aggregateFieldMetadataUniversalIdentifier: string;
  aggregateOperation: AggregateOperations;
  filters: FilterInput[];
};

const createKpiWidget = ({
  args,
  widgetName,
  title,
  column,
  objectMetadataUniversalIdentifier,
  objectMetadataId,
  aggregateFieldMetadataId,
  aggregateFieldMetadataUniversalIdentifier,
  aggregateOperation,
  filters,
}: KpiWidgetParams): FlatPageLayoutWidget => {
  const filterConfigs = createFilterConfigs(filters);

  return createStandardPageLayoutWidgetFlatMetadata({
    ...args,
    objectMetadataUniversalIdentifier,
    context: {
      layoutName: 'myFirstDashboard',
      tabTitle: 'tab1',
      widgetName,
      title,
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column, rowSpan: 2, columnSpan: 4 },
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column,
        rowSpan: 2,
        columnSpan: 4,
      },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId,
        aggregateOperation,
        displayDataLabel: false,
        filter: filterConfigs.configuration,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      universalConfiguration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataUniversalIdentifier,
        aggregateOperation,
        displayDataLabel: false,
        filter: filterConfigs.universal,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId,
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
    },
  });
};

const createNewContactsLast7Days = ({
  args,
}: {
  args: DashboardWidgetBuilderArgs;
}): FlatPageLayoutWidget => {
  const person = args.standardObjectMetadataRelatedEntityIds.person;

  return createKpiWidget({
    args,
    widgetName: 'newContactsLast7Days',
    title: 'Novos contatos (7 dias)',
    column: 0,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.person.universalIdentifier,
    objectMetadataId: person.id,
    aggregateFieldMetadataId: person.fields.id.id,
    aggregateFieldMetadataUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.id.universalIdentifier,
    aggregateOperation: AggregateOperations.COUNT,
    filters: [
      buildRelativeDateFilter({
        label: 'Creation date',
        relativeValue: 'PAST_7_DAY',
        fieldMetadataId: person.fields.createdAt.id,
        fieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.person.fields.createdAt.universalIdentifier,
      }),
    ],
  });
};

const OPEN_OPPORTUNITY_STAGES = '["NEW","SCREENING","MEETING","PROPOSAL"]';

const createOpenOpportunities = ({
  args,
}: {
  args: DashboardWidgetBuilderArgs;
}): FlatPageLayoutWidget => {
  const opportunity = args.standardObjectMetadataRelatedEntityIds.opportunity;

  return createKpiWidget({
    args,
    widgetName: 'openOpportunities',
    title: 'Oportunidades abertas',
    column: 4,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.universalIdentifier,
    objectMetadataId: opportunity.id,
    aggregateFieldMetadataId: opportunity.fields.id.id,
    aggregateFieldMetadataUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.id.universalIdentifier,
    aggregateOperation: AggregateOperations.COUNT,
    filters: [
      {
        type: 'SELECT',
        label: 'Stage',
        value: OPEN_OPPORTUNITY_STAGES,
        displayValue: OPEN_OPPORTUNITY_STAGES,
        operand: 'IS',
        fieldMetadataId: opportunity.fields.stage.id,
        fieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
      },
    ],
  });
};

// Tasks that are not finished; DONE is left out so a completed task does not
// keep counting as "due today".
const PENDING_TASK_STATUSES = '["TODO","IN_PROGRESS"]';

const createTasksDueToday = ({
  args,
}: {
  args: DashboardWidgetBuilderArgs;
}): FlatPageLayoutWidget => {
  const task = args.standardObjectMetadataRelatedEntityIds.task;

  return createKpiWidget({
    args,
    widgetName: 'tasksDueToday',
    title: 'Tarefas de hoje',
    column: 8,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.task.universalIdentifier,
    objectMetadataId: task.id,
    aggregateFieldMetadataId: task.fields.id.id,
    aggregateFieldMetadataUniversalIdentifier:
      STANDARD_OBJECTS.task.fields.id.universalIdentifier,
    aggregateOperation: AggregateOperations.COUNT,
    filters: [
      buildRelativeDateFilter({
        label: 'Due Date',
        relativeValue: 'THIS_1_DAY',
        fieldMetadataId: task.fields.dueAt.id,
        fieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.task.fields.dueAt.universalIdentifier,
      }),
      {
        type: 'SELECT',
        label: 'Status',
        value: PENDING_TASK_STATUSES,
        displayValue: PENDING_TASK_STATUSES,
        operand: 'IS',
        fieldMetadataId: task.fields.status.id,
        fieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.task.fields.status.universalIdentifier,
      },
    ],
  });
};

const createUpcomingTasksByDay = ({
  args,
}: {
  args: DashboardWidgetBuilderArgs;
}): FlatPageLayoutWidget => {
  const task = args.standardObjectMetadataRelatedEntityIds.task;
  const filterConfigs = createFilterConfigs([
    buildRelativeDateFilter({
      label: 'Due Date',
      relativeValue: 'NEXT_7_DAY',
      fieldMetadataId: task.fields.dueAt.id,
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.task.fields.dueAt.universalIdentifier,
    }),
  ]);

  return createStandardPageLayoutWidgetFlatMetadata({
    ...args,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.task.universalIdentifier,
    context: {
      layoutName: 'myFirstDashboard',
      tabTitle: 'tab1',
      widgetName: 'upcomingTasksByDay',
      title: 'Próximos compromissos',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 8, rowSpan: 6, columnSpan: 4 },
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 2,
        column: 8,
        rowSpan: 6,
        columnSpan: 4,
      },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: task.fields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: task.fields.dueAt.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: false,
        color: 'blue',
        layout: BarChartLayout.VERTICAL,
        filter: filterConfigs.configuration,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      universalConfiguration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.task.fields.id.universalIdentifier,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.task.fields.dueAt.universalIdentifier,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: false,
        color: 'blue',
        layout: BarChartLayout.VERTICAL,
        filter: filterConfigs.universal,
        timezone: DASHBOARD_TIMEZONE,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: task.id,
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
    },
  });
};

export const computeMyFirstDashboardWidgets = (
  args: DashboardWidgetBuilderArgs,
): FlatPageLayoutWidget[] => {
  return [
    createNewContactsLast7Days({ args }),
    createOpenOpportunities({ args }),
    createTasksDueToday({ args }),
    createPipelineValueByStage({ args }),
    createUpcomingTasksByDay({ args }),
  ];
};
