import { type SidebarItemDef, type TablePageDefinition } from '../types';

// The AI scenario's four created objects, extracted verbatim from the old
// rocket-object data. Each sequence entry pairs the sidebar item with its
// fully-furnished table page.
const ROCKET_PAGE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'Todos os Foguetes',
    count: 6,
  },
  columns: [
    { id: 'name', label: 'Nome', width: 200, isFirstColumn: true },
    { id: 'serialNumber', label: 'Número de Série', width: 130 },
    { id: 'manufacturer', label: 'Fabricante', width: 180 },
    { id: 'status', label: 'Status', width: 130 },
    { id: 'reusable', label: 'Reutilizável', width: 110 },
    { id: 'launchDate', label: 'Data de Lançamento', width: 140 },
    { id: 'targetOrbit', label: 'Órbita Alvo', width: 140 },
    { id: 'heightMeters', label: 'Altura (m)', width: 120, align: 'right' },
    { id: 'massKg', label: 'Massa (kg)', width: 130, align: 'right' },
  ],
  rows: [
    {
      id: 'falcon-9',
      cells: {
        name: {
          type: 'text',
          value: 'Falcon 9',
          shortLabel: 'F',
          tone: 'blue',
        },
        serialNumber: { type: 'text', value: 'B1062' },
        manufacturer: { type: 'entity', name: 'SpaceX', domain: 'spacex.com' },
        status: { type: 'select', color: 'green', value: 'Ativo' },
        reusable: { type: 'boolean', value: true },
        launchDate: { type: 'text', value: 'Apr 11, 2024' },
        targetOrbit: { type: 'text', value: 'LEO' },
        heightMeters: { type: 'number', value: '70' },
        massKg: { type: 'number', value: '549,054' },
      },
    },
    {
      id: 'starship',
      cells: {
        name: {
          type: 'text',
          value: 'Starship',
          shortLabel: 'S',
          tone: 'amber',
        },
        serialNumber: { type: 'text', value: 'S29' },
        manufacturer: { type: 'entity', name: 'SpaceX', domain: 'spacex.com' },
        status: { type: 'select', color: 'orange', value: 'Em Teste' },
        reusable: { type: 'boolean', value: true },
        launchDate: { type: 'text', value: 'Jun 6, 2024' },
        targetOrbit: { type: 'text', value: 'Transferência para Marte' },
        heightMeters: { type: 'number', value: '120' },
        massKg: { type: 'number', value: '5,000,000' },
      },
    },
    {
      id: 'new-glenn',
      cells: {
        name: {
          type: 'text',
          value: 'New Glenn',
          shortLabel: 'N',
          tone: 'teal',
        },
        serialNumber: { type: 'text', value: 'NG-1' },
        manufacturer: {
          type: 'entity',
          name: 'Blue Origin',
          domain: 'blueorigin.com',
        },
        status: { type: 'select', color: 'green', value: 'Ativo' },
        reusable: { type: 'boolean', value: true },
        launchDate: { type: 'text', value: 'Jan 16, 2025' },
        targetOrbit: { type: 'text', value: 'GTO' },
        heightMeters: { type: 'number', value: '98' },
        massKg: { type: 'number', value: '1,400,000' },
      },
    },
    {
      id: 'electron',
      cells: {
        name: {
          type: 'text',
          value: 'Electron',
          shortLabel: 'E',
          tone: 'purple',
        },
        serialNumber: { type: 'text', value: 'F52' },
        manufacturer: {
          type: 'entity',
          name: 'Rocket Lab',
          domain: 'rocketlabusa.com',
        },
        status: { type: 'select', color: 'green', value: 'Ativo' },
        reusable: { type: 'boolean', value: false },
        launchDate: { type: 'text', value: 'Sep 20, 2024' },
        targetOrbit: { type: 'text', value: 'SSO' },
        heightMeters: { type: 'number', value: '18' },
        massKg: { type: 'number', value: '13,000' },
      },
    },
    {
      id: 'ariane-6',
      cells: {
        name: {
          type: 'text',
          value: 'Ariane 6',
          shortLabel: 'A',
          tone: 'pink',
        },
        serialNumber: { type: 'text', value: 'VA262' },
        manufacturer: {
          type: 'entity',
          name: 'Arianespace',
          domain: 'arianespace.com',
        },
        status: { type: 'select', color: 'green', value: 'Ativo' },
        reusable: { type: 'boolean', value: false },
        launchDate: { type: 'text', value: 'Jul 9, 2024' },
        targetOrbit: { type: 'text', value: 'GTO' },
        heightMeters: { type: 'number', value: '63' },
        massKg: { type: 'number', value: '860,000' },
      },
    },
    {
      id: 'vulcan-centaur',
      cells: {
        name: {
          type: 'text',
          value: 'Vulcan Centaur',
          shortLabel: 'V',
          tone: 'green',
        },
        serialNumber: { type: 'text', value: 'VC-002' },
        manufacturer: {
          type: 'entity',
          name: 'ULA',
          domain: 'ulalaunch.com',
        },
        status: { type: 'select', color: 'green', value: 'Ativo' },
        reusable: { type: 'boolean', value: false },
        launchDate: { type: 'text', value: 'Oct 4, 2024' },
        targetOrbit: { type: 'text', value: 'GEO' },
        heightMeters: { type: 'number', value: '62' },
        massKg: { type: 'number', value: '546,700' },
      },
    },
  ],
};

const LAUNCH_PAGE: TablePageDefinition = {
  type: 'table',
  header: { title: 'Lançamentos', count: 5 },
  columns: [
    { id: 'name', label: 'Nome', width: 200, isFirstColumn: true },
    { id: 'missionCode', label: 'Código da Missão', width: 140 },
    { id: 'status', label: 'Status', width: 130 },
    { id: 'missionType', label: 'Tipo de Missão', width: 140 },
    { id: 'plannedLaunchAt', label: 'Lançamento Planejado', width: 170 },
    { id: 'rocket', label: 'Foguete', width: 170 },
    { id: 'launchSite', label: 'Local de Lançamento', width: 170 },
    { id: 'actualLaunchAt', label: 'Lançamento Real', width: 170 },
  ],
  rows: [
    {
      id: 'crs-29',
      cells: {
        name: { type: 'text', value: 'CRS-29', shortLabel: 'C', tone: 'blue' },
        missionCode: { type: 'text', value: 'NASA-CRS-29' },
        status: { type: 'select', color: 'green', value: 'Sucesso' },
        missionType: { type: 'select', color: 'orange', value: 'Carga' },
        plannedLaunchAt: { type: 'text', value: 'Nov 9, 2023' },
        rocket: {
          type: 'relation',
          items: [{ name: 'Falcon 9', shortLabel: 'F', tone: 'blue' }],
        },
        launchSite: {
          type: 'relation',
          items: [{ name: 'LC-39A', shortLabel: 'K', tone: 'red' }],
        },
        actualLaunchAt: { type: 'text', value: 'Nov 9, 2023' },
      },
    },
    {
      id: 'artemis-ii',
      cells: {
        name: {
          type: 'text',
          value: 'Artemis II',
          shortLabel: 'A',
          tone: 'amber',
        },
        missionCode: { type: 'text', value: 'NASA-ART-2' },
        status: { type: 'select', color: 'blue', value: 'Agendado' },
        missionType: { type: 'select', color: 'purple', value: 'Tripulado' },
        plannedLaunchAt: { type: 'text', value: 'Sep 26, 2025' },
        rocket: {
          type: 'relation',
          items: [{ name: 'SLS Block 1', shortLabel: 'S', tone: 'purple' }],
        },
        launchSite: {
          type: 'relation',
          items: [{ name: 'LC-39B', shortLabel: 'K', tone: 'red' }],
        },
        actualLaunchAt: { type: 'text', value: 'A definir' },
      },
    },
    {
      id: 'ift-5',
      cells: {
        name: {
          type: 'text',
          value: 'Starship IFT-5',
          shortLabel: 'S',
          tone: 'amber',
        },
        missionCode: { type: 'text', value: 'SPX-IFT-5' },
        status: { type: 'select', color: 'green', value: 'Sucesso' },
        missionType: { type: 'select', color: 'purple', value: 'Teste' },
        plannedLaunchAt: { type: 'text', value: 'Oct 13, 2024' },
        rocket: {
          type: 'relation',
          items: [{ name: 'Starship', shortLabel: 'S', tone: 'amber' }],
        },
        launchSite: {
          type: 'relation',
          items: [{ name: 'Starbase', shortLabel: 'S', tone: 'orange' }],
        },
        actualLaunchAt: { type: 'text', value: 'Oct 13, 2024' },
      },
    },
    {
      id: 'euclid-launch',
      cells: {
        name: { type: 'text', value: 'Euclid', shortLabel: 'E', tone: 'teal' },
        missionCode: { type: 'text', value: 'ESA-EUC-1' },
        status: { type: 'select', color: 'green', value: 'Sucesso' },
        missionType: { type: 'select', color: 'blue', value: 'Comercial' },
        plannedLaunchAt: { type: 'text', value: 'Jul 1, 2023' },
        rocket: {
          type: 'relation',
          items: [{ name: 'Falcon 9', shortLabel: 'F', tone: 'blue' }],
        },
        launchSite: {
          type: 'relation',
          items: [{ name: 'SLC-40', shortLabel: 'C', tone: 'red' }],
        },
        actualLaunchAt: { type: 'text', value: 'Jul 1, 2023' },
      },
    },
    {
      id: 'psyche-launch',
      cells: {
        name: {
          type: 'text',
          value: 'Psyche',
          shortLabel: 'P',
          tone: 'purple',
        },
        missionCode: { type: 'text', value: 'NASA-PSY-1' },
        status: { type: 'select', color: 'green', value: 'Sucesso' },
        missionType: { type: 'select', color: 'blue', value: 'Comercial' },
        plannedLaunchAt: { type: 'text', value: 'Oct 13, 2023' },
        rocket: {
          type: 'relation',
          items: [{ name: 'Falcon Heavy', shortLabel: 'F', tone: 'blue' }],
        },
        launchSite: {
          type: 'relation',
          items: [{ name: 'LC-39A', shortLabel: 'K', tone: 'red' }],
        },
        actualLaunchAt: { type: 'text', value: 'Oct 13, 2023' },
      },
    },
  ],
};

const PAYLOAD_PAGE: TablePageDefinition = {
  type: 'table',
  header: { title: 'Cargas', count: 5 },
  columns: [
    { id: 'name', label: 'Nome', width: 200, isFirstColumn: true },
    { id: 'payloadType', label: 'Tipo de Carga', width: 150 },
    { id: 'status', label: 'Status', width: 130 },
    { id: 'customer', label: 'Cliente', width: 170 },
    { id: 'launch', label: 'Lançamento', width: 170 },
    { id: 'targetOrbit', label: 'Órbita Alvo', width: 150 },
    { id: 'massKg', label: 'Massa (kg)', width: 130, align: 'right' },
  ],
  rows: [
    {
      id: 'starlink-batch-29',
      cells: {
        name: {
          type: 'text',
          value: 'Starlink v2 #29',
          shortLabel: 'S',
          tone: 'blue',
        },
        payloadType: { type: 'select', color: 'blue', value: 'Satélite' },
        status: { type: 'select', color: 'green', value: 'Implantado' },
        customer: {
          type: 'relation',
          items: [{ name: 'Starlink', shortLabel: 'S', tone: 'blue' }],
        },
        launch: {
          type: 'relation',
          items: [{ name: 'Starlink-Grp-6-20', shortLabel: 'S', tone: 'blue' }],
        },
        targetOrbit: { type: 'text', value: 'LEO 550km' },
        massKg: { type: 'number', value: '18,000' },
      },
    },
    {
      id: 'orion-artemis',
      cells: {
        name: {
          type: 'text',
          value: 'Orion Capsule',
          shortLabel: 'O',
          tone: 'amber',
        },
        payloadType: {
          type: 'select',
          color: 'purple',
          value: 'Cápsula Tripulada',
        },
        status: { type: 'select', color: 'blue', value: 'Integrado' },
        customer: {
          type: 'relation',
          items: [{ name: 'NASA', shortLabel: 'N', tone: 'red' }],
        },
        launch: {
          type: 'relation',
          items: [{ name: 'Artemis II', shortLabel: 'A', tone: 'amber' }],
        },
        targetOrbit: { type: 'text', value: 'Trânsito Lunar' },
        massKg: { type: 'number', value: '22,000' },
      },
    },
    {
      id: 'dragon-crs-29',
      cells: {
        name: {
          type: 'text',
          value: 'Dragon CRS-29',
          shortLabel: 'D',
          tone: 'blue',
        },
        payloadType: { type: 'select', color: 'orange', value: 'Carga' },
        status: { type: 'select', color: 'green', value: 'Lançado' },
        customer: {
          type: 'relation',
          items: [{ name: 'NASA', shortLabel: 'N', tone: 'red' }],
        },
        launch: {
          type: 'relation',
          items: [{ name: 'CRS-29', shortLabel: 'C', tone: 'blue' }],
        },
        targetOrbit: { type: 'text', value: 'LEO' },
        massKg: { type: 'number', value: '12,500' },
      },
    },
    {
      id: 'psyche-probe',
      cells: {
        name: {
          type: 'text',
          value: 'Psyche Probe',
          shortLabel: 'P',
          tone: 'purple',
        },
        payloadType: { type: 'select', color: 'turquoise', value: 'Sonda' },
        status: { type: 'select', color: 'green', value: 'Implantado' },
        customer: {
          type: 'relation',
          items: [{ name: 'NASA', shortLabel: 'N', tone: 'red' }],
        },
        launch: {
          type: 'relation',
          items: [{ name: 'Psyche', shortLabel: 'P', tone: 'purple' }],
        },
        targetOrbit: { type: 'text', value: 'Cinturão de Asteroides' },
        massKg: { type: 'number', value: '2,747' },
      },
    },
    {
      id: 'euclid-observatory',
      cells: {
        name: {
          type: 'text',
          value: 'Euclid Observatory',
          shortLabel: 'E',
          tone: 'teal',
        },
        payloadType: { type: 'select', color: 'blue', value: 'Satélite' },
        status: { type: 'select', color: 'green', value: 'Implantado' },
        customer: {
          type: 'relation',
          items: [{ name: 'ESA', shortLabel: 'E', tone: 'teal' }],
        },
        launch: {
          type: 'relation',
          items: [{ name: 'Euclid', shortLabel: 'E', tone: 'teal' }],
        },
        targetOrbit: { type: 'text', value: 'Sol-Terra L2' },
        massKg: { type: 'number', value: '2,160' },
      },
    },
  ],
};

const LAUNCH_SITE_PAGE: TablePageDefinition = {
  type: 'table',
  header: { title: 'Locais de Lançamento', count: 5 },
  columns: [
    { id: 'name', label: 'Nome', width: 220, isFirstColumn: true },
    { id: 'siteCode', label: 'Código do Local', width: 140 },
    { id: 'padName', label: 'Nome da Plataforma', width: 180 },
    { id: 'country', label: 'País', width: 140 },
    { id: 'siteStatus', label: 'Status do Local', width: 150 },
  ],
  rows: [
    {
      id: 'ksc-39a',
      cells: {
        name: {
          type: 'text',
          value: 'Kennedy LC-39A',
          shortLabel: 'K',
          tone: 'red',
        },
        siteCode: { type: 'text', value: 'KSC-39A' },
        padName: { type: 'text', value: 'Launch Complex 39A' },
        country: { type: 'text', value: 'Estados Unidos' },
        siteStatus: { type: 'select', color: 'green', value: 'Ativo' },
      },
    },
    {
      id: 'ccsfs-slc-40',
      cells: {
        name: {
          type: 'text',
          value: 'Cape Canaveral SLC-40',
          shortLabel: 'C',
          tone: 'red',
        },
        siteCode: { type: 'text', value: 'CCSFS-40' },
        padName: { type: 'text', value: 'Space Launch Complex 40' },
        country: { type: 'text', value: 'Estados Unidos' },
        siteStatus: { type: 'select', color: 'green', value: 'Ativo' },
      },
    },
    {
      id: 'starbase',
      cells: {
        name: {
          type: 'text',
          value: 'Starbase',
          shortLabel: 'S',
          tone: 'orange',
        },
        siteCode: { type: 'text', value: 'SB-01' },
        padName: { type: 'text', value: 'Orbital Launch Pad A' },
        country: { type: 'text', value: 'Estados Unidos' },
        siteStatus: { type: 'select', color: 'green', value: 'Ativo' },
      },
    },
    {
      id: 'vandenberg-slc-4e',
      cells: {
        name: {
          type: 'text',
          value: 'Vandenberg SLC-4E',
          shortLabel: 'V',
          tone: 'purple',
        },
        siteCode: { type: 'text', value: 'VSFB-4E' },
        padName: { type: 'text', value: 'Space Launch Complex 4E' },
        country: { type: 'text', value: 'Estados Unidos' },
        siteStatus: { type: 'select', color: 'green', value: 'Ativo' },
      },
    },
    {
      id: 'kourou-ela-4',
      cells: {
        name: {
          type: 'text',
          value: 'Kourou ELA-4',
          shortLabel: 'K',
          tone: 'teal',
        },
        siteCode: { type: 'text', value: 'CSG-4' },
        padName: { type: 'text', value: 'Ensemble de Lancement 4' },
        country: { type: 'text', value: 'Guiana Francesa' },
        siteStatus: { type: 'select', color: 'green', value: 'Ativo' },
      },
    },
  ],
};

const ROCKET_SIDEBAR_ITEM: SidebarItemDef = {
  id: 'rockets',
  label: 'Foguetes',
  icon: { kind: 'tabler', name: 'rocket', tone: 'violet' },
  page: ROCKET_PAGE,
};

const LAUNCH_SIDEBAR_ITEM: SidebarItemDef = {
  id: 'launches',
  label: 'Lançamentos',
  icon: { kind: 'tabler', name: 'calendarEvent', tone: 'violet' },
  page: LAUNCH_PAGE,
};

const PAYLOAD_SIDEBAR_ITEM: SidebarItemDef = {
  id: 'payloads',
  label: 'Cargas',
  icon: { kind: 'tabler', name: 'planet', tone: 'violet' },
  page: PAYLOAD_PAGE,
};

const LAUNCH_SITE_SIDEBAR_ITEM: SidebarItemDef = {
  id: 'launch-sites',
  label: 'Locais de Lançamento',
  icon: { kind: 'tabler', name: 'mapPin', tone: 'violet' },
  page: LAUNCH_SITE_PAGE,
};

type CrmScenarioEntry = {
  id: string;
  label: string;
  sidebarItem: SidebarItemDef;
};

const CRM_OBJECT_SEQUENCE: ReadonlyArray<CrmScenarioEntry> = [
  {
    id: ROCKET_SIDEBAR_ITEM.id,
    label: ROCKET_SIDEBAR_ITEM.label,
    sidebarItem: ROCKET_SIDEBAR_ITEM,
  },
  {
    id: LAUNCH_SIDEBAR_ITEM.id,
    label: LAUNCH_SIDEBAR_ITEM.label,
    sidebarItem: LAUNCH_SIDEBAR_ITEM,
  },
  {
    id: PAYLOAD_SIDEBAR_ITEM.id,
    label: PAYLOAD_SIDEBAR_ITEM.label,
    sidebarItem: PAYLOAD_SIDEBAR_ITEM,
  },
  {
    id: LAUNCH_SITE_SIDEBAR_ITEM.id,
    label: LAUNCH_SITE_SIDEBAR_ITEM.label,
    sidebarItem: LAUNCH_SITE_SIDEBAR_ITEM,
  },
];

export const CRM_SCENARIO = {
  companiesItemId: 'companies',
  sequence: CRM_OBJECT_SEQUENCE,
};
