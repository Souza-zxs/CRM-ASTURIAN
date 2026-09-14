import { ZYRA_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/zyra-current-version.constant';
import { ZYRA_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/zyra-previous-versions.constant';

export const ZYRA_CROSS_UPGRADE_SUPPORTED_VERSIONS = [
  ...ZYRA_PREVIOUS_VERSIONS,
  ZYRA_CURRENT_VERSION,
] as const;

export type ZyraCrossUpgradeSupportedVersion =
  (typeof ZYRA_CROSS_UPGRADE_SUPPORTED_VERSIONS)[number];
