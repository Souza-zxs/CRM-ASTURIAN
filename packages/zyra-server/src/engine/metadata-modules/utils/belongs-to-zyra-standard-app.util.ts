import { ZYRA_STANDARD_APPLICATION } from 'src/engine/workspace-manager/zyra-standard-application/constants/zyra-standard-applications';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export const belongsToZyraStandardApp = <
  T extends UniversalSyncableFlatEntity,
>({
  applicationUniversalIdentifier,
}: T) =>
  applicationUniversalIdentifier ===
  ZYRA_STANDARD_APPLICATION.universalIdentifier;
