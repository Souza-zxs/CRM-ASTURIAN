import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'zyra-shared/metadata';
import { FieldMetadataType } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Adds the UTM fields (spec Part C: copy utm_source/medium/campaign from the
// FunnelLead to Person and Opportunity) and the workshop session field (Part
// A: workflow triggers read this off the Opportunity, since DATABASE_EVENT
// triggers can't watch the core-schema FunnelLead table). Only for
// workspaces that pre-date compute-person/opportunity-standard-flat-field-
// metadata.util.ts gaining these fields — new workspaces get them from the
// seed directly.
@RegisteredWorkspaceCommand('2.16.0', 1803000000000)
@Command({
  name: 'upgrade:2-16:add-utm-and-workshop-session-fields',
  description:
    'Add utmSource/utmMedium/utmCampaign to Person and Opportunity, and workshopSessionScheduledAt to Opportunity, for existing workspaces.',
})
export class AddUtmAndWorkshopSessionFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const personObject = findFlatEntityByUniversalIdentifier<FlatObjectMetadata>(
      {
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      },
    );
    const opportunityObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
      });

    const createFieldInputs: Omit<CreateFieldInput, 'workspaceId'>[] = [];

    const pushIfMissing = (
      object: FlatObjectMetadata | undefined,
      fieldKey: string,
      input: Omit<CreateFieldInput, 'workspaceId' | 'objectMetadataId' | 'universalIdentifier'>,
      universalIdentifier: string,
    ) => {
      if (!isDefined(object)) {
        return;
      }

      const existingField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
        {
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        },
      );

      if (isDefined(existingField)) {
        this.logger.log(
          `${fieldKey} already present for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      createFieldInputs.push({
        ...input,
        objectMetadataId: object.id,
        universalIdentifier,
      });
    };

    pushIfMissing(
      personObject,
      'utmSource',
      {
        name: 'utmSource',
        type: FieldMetadataType.TEXT,
        label: 'Fonte (UTM)',
        description: 'utm_source do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.person.fields.utmSource.universalIdentifier,
    );
    pushIfMissing(
      personObject,
      'utmMedium',
      {
        name: 'utmMedium',
        type: FieldMetadataType.TEXT,
        label: 'Mídia (UTM)',
        description: 'utm_medium do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.person.fields.utmMedium.universalIdentifier,
    );
    pushIfMissing(
      personObject,
      'utmCampaign',
      {
        name: 'utmCampaign',
        type: FieldMetadataType.TEXT,
        label: 'Campanha (UTM)',
        description: 'utm_campaign do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.person.fields.utmCampaign.universalIdentifier,
    );
    pushIfMissing(
      opportunityObject,
      'utmSource',
      {
        name: 'utmSource',
        type: FieldMetadataType.TEXT,
        label: 'Fonte (UTM)',
        description: 'utm_source do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.opportunity.fields.utmSource.universalIdentifier,
    );
    pushIfMissing(
      opportunityObject,
      'utmMedium',
      {
        name: 'utmMedium',
        type: FieldMetadataType.TEXT,
        label: 'Mídia (UTM)',
        description: 'utm_medium do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.opportunity.fields.utmMedium.universalIdentifier,
    );
    pushIfMissing(
      opportunityObject,
      'utmCampaign',
      {
        name: 'utmCampaign',
        type: FieldMetadataType.TEXT,
        label: 'Campanha (UTM)',
        description: 'utm_campaign do formulário de inscrição',
        icon: 'IconAd2',
        isNullable: true,
      },
      STANDARD_OBJECTS.opportunity.fields.utmCampaign.universalIdentifier,
    );
    pushIfMissing(
      opportunityObject,
      'workshopSessionScheduledAt',
      {
        name: 'workshopSessionScheduledAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Sessão do workshop',
        description:
          'Horário da sessão do workshop em que este lead foi colocado',
        icon: 'IconCalendarEvent',
        isNullable: true,
      },
      STANDARD_OBJECTS.opportunity.fields.workshopSessionScheduledAt
        .universalIdentifier,
    );

    if (createFieldInputs.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${createFieldInputs.length} field(s) for workspace ${workspaceId}: ${createFieldInputs.map((f) => f.name).join(', ')}`,
      );

      return;
    }

    const { zyraStandardFlatApplication } =
      await this.applicationService.findWorkspaceZyraStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    try {
      await this.fieldMetadataService.createManyFields({
        createFieldInputs,
        workspaceId,
        ownerFlatApplication: zyraStandardFlatApplication,
        isSystemBuild: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to add UTM/workshop session fields for workspace ${workspaceId}:\n${
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
        }`,
      );
      throw error;
    }

    this.logger.log(
      `Added ${createFieldInputs.length} field(s) for workspace ${workspaceId}: ${createFieldInputs.map((f) => f.name).join(', ')}`,
    );
  }
}
