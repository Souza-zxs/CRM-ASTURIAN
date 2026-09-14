import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const APPLICATION_REGISTRATION_ADMIN_PATH = getSettingsPath(
  SettingsPath.AdminPanel,
  undefined,
  undefined,
  'apps',
);
