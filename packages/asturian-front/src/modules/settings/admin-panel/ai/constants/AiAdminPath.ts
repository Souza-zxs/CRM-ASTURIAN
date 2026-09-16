import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const AI_ADMIN_PATH = getSettingsPath(
  SettingsPath.AdminPanel,
  undefined,
  undefined,
  'ai',
);
