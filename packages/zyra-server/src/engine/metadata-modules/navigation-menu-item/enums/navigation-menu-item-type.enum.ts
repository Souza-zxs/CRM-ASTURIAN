import { registerEnumType } from '@nestjs/graphql';

import { NavigationMenuItemType } from 'zyra-shared/types';

registerEnumType(NavigationMenuItemType, {
  name: 'NavigationMenuItemType',
});

export { NavigationMenuItemType };
