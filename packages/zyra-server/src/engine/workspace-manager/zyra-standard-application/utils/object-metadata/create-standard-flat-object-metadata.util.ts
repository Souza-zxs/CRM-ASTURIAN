import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'zyra-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/zyra-standard-application/types/all-standard-object-name.type';
import { i18nLabel } from 'src/engine/workspace-manager/zyra-standard-application/utils/i18n-label.util';
import {
  type CreateStandardObjectArgs,
  createStandardObjectFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/object-metadata/create-standard-object-flat-metadata.util';

export const STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'attachment'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'attachment',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
        nameSingular: 'attachment',
        namePlural: 'attachments',
        labelSingular: i18nLabel(msg`Anexo`),
        labelPlural: i18nLabel(msg`Anexos`),
        description: i18nLabel(msg`Um anexo`),
        icon: 'IconFileImport',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  blocklist: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'blocklist'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'blocklist',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
        nameSingular: 'blocklist',
        namePlural: 'blocklists',
        labelSingular: i18nLabel(msg`Lista de bloqueio`),
        labelPlural: i18nLabel(msg`Listas de bloqueio`),
        description: i18nLabel(msg`Lista de bloqueio`),
        icon: 'IconForbid2',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  calendarChannelEventAssociation: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarChannelEventAssociation'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarChannelEventAssociation',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
        nameSingular: 'calendarChannelEventAssociation',
        namePlural: 'calendarChannelEventAssociations',
        labelSingular: i18nLabel(msg`Associação de evento do canal de calendário`),
        labelPlural: i18nLabel(msg`Associações de evento do canal de calendário`),
        description: i18nLabel(msg`Associações de evento do canal de calendário`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  calendarEventParticipant: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarEventParticipant'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarEventParticipant',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
        nameSingular: 'calendarEventParticipant',
        namePlural: 'calendarEventParticipants',
        labelSingular: i18nLabel(msg`Participante do evento de calendário`),
        labelPlural: i18nLabel(msg`Participantes do evento de calendário`),
        description: i18nLabel(msg`Participantes do evento de calendário`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  calendarEvent: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarEvent'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarEvent',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        nameSingular: 'calendarEvent',
        namePlural: 'calendarEvents',
        labelSingular: i18nLabel(msg`Evento de calendário`),
        labelPlural: i18nLabel(msg`Eventos de calendário`),
        description: i18nLabel(msg`Eventos de calendário`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  callRecording: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'callRecording'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'callRecording',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
        labelSingular: i18nLabel(msg`Gravação de chamada`),
        labelPlural: i18nLabel(msg`Gravações de chamada`),
        description: i18nLabel(msg`Uma gravação de reunião`),
        icon: 'IconVideo',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  company: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'company'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'company',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: i18nLabel(msg`Empresa`),
        labelPlural: i18nLabel(msg`Empresas`),
        description: i18nLabel(msg`Uma empresa`),
        icon: 'IconBuildingSkyscraper',
        isSearchable: true,
        shortcut: 'C',
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  dashboard: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'dashboard'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'dashboard',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.dashboard.universalIdentifier,
        nameSingular: 'dashboard',
        namePlural: 'dashboards',
        labelSingular: i18nLabel(msg`Painel`),
        labelPlural: i18nLabel(msg`Painéis`),
        description: i18nLabel(msg`Um painel`),
        icon: 'IconLayoutDashboard',
        isSearchable: true,
        shortcut: 'D',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageCampaign: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageCampaign'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageCampaign',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        nameSingular: 'messageCampaign',
        namePlural: 'messageCampaigns',
        labelSingular: i18nLabel(msg`Campanha`),
        labelPlural: i18nLabel(msg`Campanhas`),
        description: i18nLabel(
          msg`Um envio de e-mail em massa para um público, com estatísticas de entrega`,
        ),
        icon: 'IconSend',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'subject',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageList: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'messageList'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageList',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.messageList.universalIdentifier,
        nameSingular: 'messageList',
        namePlural: 'messageLists',
        labelSingular: i18nLabel(msg`Lista`),
        labelPlural: i18nLabel(msg`Listas`),
        description: i18nLabel(msg`Um público de pessoas selecionadas manualmente`),
        icon: 'IconUsersGroup',
        isSystem: true,
        isSearchable: true,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageListMember: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageListMember'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageListMember',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageListMember.universalIdentifier,
        nameSingular: 'messageListMember',
        namePlural: 'messageListMembers',
        labelSingular: i18nLabel(msg`Membro da lista`),
        labelPlural: i18nLabel(msg`Membros da lista`),
        description: i18nLabel(msg`A participação de uma pessoa em uma lista`),
        icon: 'IconUser',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageChannelMessageAssociation: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageChannelMessageAssociation'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
        nameSingular: 'messageChannelMessageAssociation',
        namePlural: 'messageChannelMessageAssociations',
        labelSingular: i18nLabel(msg`Associação de mensagens do canal de mensagens`),
        labelPlural: i18nLabel(msg`Associações de mensagem do canal de mensagens`),
        description: i18nLabel(msg`Mensagem sincronizada com um canal de mensagens`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageChannelMessageAssociationMessageFolder: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageChannelMessageAssociationMessageFolder'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageChannelMessageAssociationMessageFolder',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
            .universalIdentifier,
        nameSingular: 'messageChannelMessageAssociationMessageFolder',
        namePlural: 'messageChannelMessageAssociationMessageFolders',
        labelSingular: i18nLabel(
          msg`Pasta de mensagens da associação de mensagem do canal de mensagens`,
        ),
        labelPlural: i18nLabel(
          msg`Pastas de mensagens da associação de mensagem do canal de mensagens`,
        ),
        description: i18nLabel(
          msg`Tabela de junção que vincula associações de mensagem do canal de mensagens às pastas de mensagens`,
        ),
        icon: 'IconFolder',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageParticipant: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageParticipant'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageParticipant',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageParticipant.universalIdentifier,
        nameSingular: 'messageParticipant',
        namePlural: 'messageParticipants',
        labelSingular: i18nLabel(msg`Participante da mensagem`),
        labelPlural: i18nLabel(msg`Participantes da mensagem`),
        description: i18nLabel(msg`Participantes da mensagem`),
        icon: 'IconUserCircle',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  messageThread: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageThread'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageThread',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
        nameSingular: 'messageThread',
        namePlural: 'messageThreads',
        labelSingular: i18nLabel(msg`Conversa de mensagens`),
        labelPlural: i18nLabel(msg`Conversas de mensagens`),
        description: i18nLabel(msg`Conversa de mensagens`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'subject',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  message: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'message'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'message',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
        nameSingular: 'message',
        namePlural: 'messages',
        labelSingular: i18nLabel(msg`Mensagem`),
        labelPlural: i18nLabel(msg`Mensagens`),
        description: i18nLabel(msg`Mensagem`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'subject',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  note: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'note'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'note',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
        nameSingular: 'note',
        namePlural: 'notes',
        labelSingular: i18nLabel(msg`Nota`),
        labelPlural: i18nLabel(msg`Notas`),
        description: i18nLabel(msg`Uma nota`),
        icon: 'IconNotes',
        isSearchable: true,
        shortcut: 'N',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  noteTarget: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'noteTarget'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'noteTarget',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
        nameSingular: 'noteTarget',
        namePlural: 'noteTargets',
        labelSingular: i18nLabel(msg`Destino da nota`),
        labelPlural: i18nLabel(msg`Destinos da nota`),
        description: i18nLabel(msg`Um destino da nota`),
        icon: 'IconCheckbox',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  opportunity: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'opportunity'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'opportunity',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
        labelSingular: i18nLabel(msg`Oportunidade`),
        labelPlural: i18nLabel(msg`Oportunidades`),
        description: i18nLabel(msg`Uma oportunidade`),
        icon: 'IconTargetArrow',
        isSearchable: true,
        shortcut: 'O',
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  person: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'person'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'person',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        nameSingular: 'person',
        namePlural: 'people',
        labelSingular: i18nLabel(msg`Pessoa`),
        labelPlural: i18nLabel(msg`Pessoas`),
        description: i18nLabel(msg`Uma pessoa`),
        icon: 'IconUser',
        isSearchable: true,
        shortcut: 'P',
        duplicateCriteria: [
          ['nameFirstName', 'nameLastName'],
          ['linkedinLinkPrimaryLinkUrl'],
          ['emailsPrimaryEmail'],
        ],
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarUrl',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  task: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'task'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'task',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
        nameSingular: 'task',
        namePlural: 'tasks',
        labelSingular: i18nLabel(msg`Tarefa`),
        labelPlural: i18nLabel(msg`Tarefas`),
        description: i18nLabel(msg`Uma tarefa`),
        icon: 'IconCheckbox',
        isSearchable: true,
        shortcut: 'T',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  taskTarget: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'taskTarget'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'taskTarget',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
        nameSingular: 'taskTarget',
        namePlural: 'taskTargets',
        labelSingular: i18nLabel(msg`Destino da tarefa`),
        labelPlural: i18nLabel(msg`Destinos da tarefa`),
        description: i18nLabel(msg`Um destino da tarefa`),
        icon: 'IconCheckbox',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  timelineActivity: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'timelineActivity'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'timelineActivity',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        nameSingular: 'timelineActivity',
        namePlural: 'timelineActivities',
        labelSingular: i18nLabel(msg`Atividade da linha do tempo`),
        labelPlural: i18nLabel(msg`Atividades da linha do tempo`),
        description: i18nLabel(
          msg`Evento agregado / filtrado a ser exibido na linha do tempo`,
        ),
        icon: 'IconTimelineEvent',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  workflow: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'workflow'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflow',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
        nameSingular: 'workflow',
        namePlural: 'workflows',
        labelSingular: i18nLabel(msg`Fluxo de trabalho`),
        labelPlural: i18nLabel(msg`Fluxos de trabalho`),
        description: i18nLabel(msg`Um fluxo de trabalho`),
        icon: 'IconSettingsAutomation',
        isSearchable: true,
        shortcut: 'W',
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  workflowAutomatedTrigger: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workflowAutomatedTrigger'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowAutomatedTrigger',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
        nameSingular: 'workflowAutomatedTrigger',
        namePlural: 'workflowAutomatedTriggers',
        labelSingular: i18nLabel(msg`Gatilho automatizado do fluxo de trabalho`),
        labelPlural: i18nLabel(msg`Gatilhos automatizados do fluxo de trabalho`),
        description: i18nLabel(msg`Um gatilho automatizado do fluxo de trabalho`),
        icon: 'IconSettingsAutomation',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  workflowRun: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'workflowRun'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowRun',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
        nameSingular: 'workflowRun',
        namePlural: 'workflowRuns',
        labelSingular: i18nLabel(msg`Execução do fluxo de trabalho`),
        labelPlural: i18nLabel(msg`Execuções do fluxo de trabalho`),
        description: i18nLabel(msg`Uma execução do fluxo de trabalho`),
        icon: 'IconHistoryToggle',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  workflowVersion: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workflowVersion'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowVersion',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        nameSingular: 'workflowVersion',
        namePlural: 'workflowVersions',
        labelSingular: i18nLabel(msg`Versão do fluxo de trabalho`),
        labelPlural: i18nLabel(msg`Versões do fluxo de trabalho`),
        description: i18nLabel(msg`Uma versão do fluxo de trabalho`),
        icon: 'IconVersions',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
  workspaceMember: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    zyraStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workspaceMember'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workspaceMember',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.universalIdentifier,
        nameSingular: 'workspaceMember',
        namePlural: 'workspaceMembers',
        labelSingular: i18nLabel(msg`Membro do workspace`),
        labelPlural: i18nLabel(msg`Membros do workspace`),
        description: i18nLabel(msg`Um membro do workspace`),
        icon: 'IconUserCircle',
        isSystem: true,
        isSearchable: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarUrl',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      zyraStandardApplicationId,
      now,
    }),
} satisfies {
  [P in AllStandardObjectName]: (
    args: Omit<CreateStandardObjectArgs<P>, 'context' | 'objectName'>,
  ) => FlatObjectMetadata;
};
