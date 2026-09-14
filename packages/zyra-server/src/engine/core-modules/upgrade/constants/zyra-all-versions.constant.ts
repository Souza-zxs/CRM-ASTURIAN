import { ZYRA_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/zyra-current-version.constant';
import { ZYRA_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/zyra-next-versions.constant';
import { ZYRA_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/zyra-previous-versions.constant';

export const ZYRA_ALL_VERSIONS = [
  ...ZYRA_PREVIOUS_VERSIONS,
  ZYRA_CURRENT_VERSION,
  ...ZYRA_NEXT_VERSIONS,
] as const;

export type ZyraAllVersion = (typeof ZYRA_ALL_VERSIONS)[number];
