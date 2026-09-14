import { type FeatureFlagKey } from 'zyra-shared/types';

export type FeatureFlagMap = Record<`${FeatureFlagKey}`, boolean>;
