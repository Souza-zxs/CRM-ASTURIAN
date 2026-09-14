import { registerEnumType } from '@nestjs/graphql';

import { UpgradeHealthEnum } from 'zyra-shared/types';

export { UpgradeHealthEnum };

registerEnumType(UpgradeHealthEnum, {
  name: 'UpgradeHealth',
});
