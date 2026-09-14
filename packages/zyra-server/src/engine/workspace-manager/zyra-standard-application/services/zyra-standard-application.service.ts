import { Injectable } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ZYRA_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/zyra-standard-application/constants/zyra-standard-all-metadata-name.constant';
import { computeZyraStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/zyra-standard-application/utils/zyra-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

// TODO completely deprecate this file once we've created the zyra-standard zyra-app manifest
@Injectable()
export class ZyraStandardApplicationService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async synchronizeZyraStandardApplicationOrThrow({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const { zyraStandardFlatApplication } =
      await this.applicationService.findWorkspaceZyraStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const { featureFlagsMap, ...fromZyraStandardAllFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...ZYRA_STANDARD_ALL_METADATA_NAME.map(getMetadataFlatEntityMapsKey),
        'featureFlagsMap',
      ]);

    const {
      allFlatEntityMaps: toZyraStandardAllFlatEntityMaps,
      idByUniversalIdentifierByMetadataName,
    } = computeZyraStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      zyraStandardApplicationId: zyraStandardFlatApplication.id,
    });

    const fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps = {};

    for (const metadataName of ZYRA_STANDARD_ALL_METADATA_NAME) {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const fromFlatEntityMaps =
        fromZyraStandardAllFlatEntityMaps[flatEntityMapsKey];
      const fromTo = {
        from: getSubFlatEntityMapsByApplicationIdsOrThrow<
          MetadataFlatEntity<typeof metadataName>
        >({
          applicationIds: [zyraStandardFlatApplication.id],
          flatEntityMaps: fromFlatEntityMaps,
        }),
        to: toZyraStandardAllFlatEntityMaps[flatEntityMapsKey],
      };

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier:
              zyraStandardFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },
          idByUniversalIdentifierByMetadataName,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while synchronizing zyra-standard application',
      );
    }
  }
}
