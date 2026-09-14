import { registerEnumType } from '@nestjs/graphql';

import { EventLogTable } from 'zyra-shared/types';

export const registerEventLogTableEnum = () => {
  registerEnumType(EventLogTable, {
    name: 'EventLogTable',
  });
};
