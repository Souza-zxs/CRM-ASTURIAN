import { type PerformZyraConfigQueryParams } from 'test/integration/zyra-config/types/perform-zyra-config-query.type';

import { makeAdminPanelAPIRequest } from './make-admin-panel-api-request.util';
import {
  type UpdateConfigVariableFactoryInput,
  updateConfigVariableQueryFactory,
} from './update-config-variable.query-factory.util';

export const updateConfigVariable = async ({
  input,
  expectToFail = false,
}: PerformZyraConfigQueryParams<UpdateConfigVariableFactoryInput>) => {
  const graphqlOperation = updateConfigVariableQueryFactory({
    key: input.key,
    value: input.value,
  });

  const response = await makeAdminPanelAPIRequest(graphqlOperation);

  if (!expectToFail) {
    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateDatabaseConfigVariable).toBeDefined();
  } else {
    expect(response.body.errors).toBeDefined();
  }

  return { data: response.body.data, errors: response.body.errors };
};
