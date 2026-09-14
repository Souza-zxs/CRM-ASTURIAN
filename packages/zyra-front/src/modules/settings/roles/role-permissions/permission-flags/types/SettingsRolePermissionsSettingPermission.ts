import { type IconComponent } from 'zyra-ui/icon';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsRolePermissionsSettingPermission = {
  key: PermissionFlagType;
  name: string;
  description: string;
  Icon: IconComponent;
  isToolPermission?: boolean;
  isRelevantForAgents?: boolean;
  isRelevantForApiKeys?: boolean;
  isRelevantForUsers?: boolean;
};
