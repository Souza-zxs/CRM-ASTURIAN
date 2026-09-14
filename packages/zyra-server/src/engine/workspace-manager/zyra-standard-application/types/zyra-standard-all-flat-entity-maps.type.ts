import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type ZYRA_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/zyra-standard-application/constants/zyra-standard-all-metadata-name.constant';

export type ZyraStandardAllFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    (typeof ZYRA_STANDARD_ALL_METADATA_NAME)[number]
  >
>;
