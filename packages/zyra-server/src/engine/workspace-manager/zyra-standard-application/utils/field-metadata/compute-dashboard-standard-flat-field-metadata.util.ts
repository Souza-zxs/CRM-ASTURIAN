import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/zyra-standard-application/utils/i18n-label.util';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationType,
} from 'zyra-shared/types';

import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/zyra-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/zyra-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/zyra-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_DASHBOARD } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

export const buildDashboardStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  zyraStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'dashboard', FieldMetadataType>,
  'context'
>): Record<AllStandardObjectFieldName<'dashboard'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg`Id`),
      description: i18nLabel(msg`Id`),
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'uuid',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(msg`Data de criação`),
      description: i18nLabel(msg`Data de criação`),
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(msg`Última atualização`),
      description: i18nLabel(msg`Última vez que o registro foi alterado`),
      icon: 'IconCalendarClock',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(msg`Excluído em`),
      description: i18nLabel(msg`Data em que o registro foi excluído`),
      icon: 'IconCalendarMinus',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),

  // Dashboard-specific fields
  title: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'title',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(msg`Título`),
      description: i18nLabel(msg`Título do painel`),
      icon: 'IconNotes',
      isNullable: true,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  position: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: i18nLabel(msg`Posição`),
      description: i18nLabel(msg`Posição do registro do painel`),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  pageLayoutId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'pageLayoutId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg`ID do layout da página`),
      description: i18nLabel(msg`Layout da página do painel`),
      icon: 'IconLayout',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(msg`Criado por`),
      description: i18nLabel(msg`O criador do registro`),
      icon: 'IconCreativeCommonsSa',
      isSystem: true,
      isUIEditable: false,
      isNullable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  updatedBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(msg`Atualizado por`),
      description: i18nLabel(
        msg`O membro do workspace que atualizou o registro por último`,
      ),
      icon: 'IconUserCircle',
      isSystem: true,
      isUIEditable: false,
      isNullable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  searchVector: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: i18nLabel(msg`Vetor de busca`),
      description: i18nLabel(msg`Campo usado para busca de texto completo`),
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
      settings: {
        generatedType: 'STORED',
        asExpression: getTsVectorColumnExpressionFromFields(
          SEARCH_FIELDS_FOR_DASHBOARD,
        ),
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),

  // Relation fields
  timelineActivities: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'timelineActivities',
      label: i18nLabel(
        STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT.timelineActivity
          .label,
      ),
      description: i18nLabel(msg`Atividades da linha do tempo vinculadas ao painel`),
      icon: STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT
        .timelineActivity.icon,
      isNullable: true,
      targetObjectName: 'timelineActivity',
      targetFieldName: 'targetDashboard',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
  attachments: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'attachments',
      label: i18nLabel(
        STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT.attachment.label,
      ),
      description: i18nLabel(msg`Anexos vinculados ao painel`),
      icon: STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT.attachment
        .icon,
      isNullable: true,
      targetObjectName: 'attachment',
      targetFieldName: 'targetDashboard',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    zyraStandardApplicationId,
    now,
  }),
});
