import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'zyra-shared/metadata';
import { PageLayoutTabLayoutMode } from 'zyra-shared/types';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const DASHBOARD_WIDGET_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1.widgets;

// The default dashboard ("Início") shows the operation's real numbers: three
// KPIs on top, the pipeline by stage and the tasks of the next seven days.
// Widgets of the previous sample dashboard keep their identifiers in
// zyra-shared (no-delete rule) but are no longer created here.
const DASHBOARD_PAGE_TABS = {
  tab1: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard.tabs.tab1
        .universalIdentifier,
    title: 'Tab 1',
    position: 0,
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    widgets: {
      newContactsLast7Days: {
        universalIdentifier:
          DASHBOARD_WIDGET_IDENTIFIERS.newContactsLast7Days.universalIdentifier,
      },
      openOpportunities: {
        universalIdentifier:
          DASHBOARD_WIDGET_IDENTIFIERS.openOpportunities.universalIdentifier,
      },
      tasksDueToday: {
        universalIdentifier:
          DASHBOARD_WIDGET_IDENTIFIERS.tasksDueToday.universalIdentifier,
      },
      pipelineValueByStage: {
        universalIdentifier:
          DASHBOARD_WIDGET_IDENTIFIERS.pipelineValueByStage.universalIdentifier,
      },
      upcomingTasksByDay: {
        universalIdentifier:
          DASHBOARD_WIDGET_IDENTIFIERS.upcomingTasksByDay.universalIdentifier,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG = {
  name: 'Início',
  type: PageLayoutType.DASHBOARD,
  objectUniversalIdentifier: null,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: DASHBOARD_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
