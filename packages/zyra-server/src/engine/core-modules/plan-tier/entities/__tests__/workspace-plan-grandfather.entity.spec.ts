import { getMetadataArgsStorage } from 'typeorm';

import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';

describe('WorkspacePlanGrandfatherEntity', () => {
  it('is registered under the core schema with the expected table name', () => {
    const table = getMetadataArgsStorage().tables.find(
      (entry) => entry.target === WorkspacePlanGrandfatherEntity,
    );

    expect(table?.name).toBe('workspacePlanGrandfather');
    expect(table?.schema).toBe('core');
  });
});
