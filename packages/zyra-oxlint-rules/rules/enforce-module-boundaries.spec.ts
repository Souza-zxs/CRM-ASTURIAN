import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './enforce-module-boundaries';

const depConstraints = [
  {
    sourceTag: 'scope:frontend',
    onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend'],
  },
  {
    sourceTag: 'scope:backend',
    onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend'],
  },
  {
    sourceTag: 'scope:shared',
    onlyDependOnLibsWithTags: ['scope:shared'],
  },
];

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: "import { isDefined } from 'zyra-shared';",
      options: [{ depConstraints }],
      filename: '/project/packages/asturian-front/src/utils.ts',
    },
    {
      code: "import { Button } from 'zyra-ui';",
      options: [{ depConstraints }],
      filename: '/project/packages/asturian-front/src/components.tsx',
    },
    {
      code: "import { isDefined } from 'zyra-shared';",
      options: [{ depConstraints }],
      filename: '/project/packages/zyra-server/src/utils.ts',
    },
    {
      code: "import { helper } from './local';",
      options: [{ depConstraints }],
      filename: '/project/packages/asturian-front/src/utils.ts',
    },
    {
      code: "import lodash from 'lodash';",
      options: [{ depConstraints }],
      filename: '/project/packages/asturian-front/src/utils.ts',
    },
    {
      code: "import { isDefined } from 'zyra-shared';",
      options: [{ depConstraints: [] }],
      filename: '/project/packages/asturian-front/src/utils.ts',
    },
  ],
  invalid: [
    {
      code: "import { ServerService } from 'zyra-server';",
      options: [{ depConstraints }],
      filename: '/project/packages/asturian-front/src/bad-import.ts',
      errors: [{ messageId: 'moduleBoundaryViolation' }],
    },
    {
      code: "import { Component } from 'asturian-front';",
      options: [{ depConstraints }],
      filename: '/project/packages/zyra-server/src/bad-import.ts',
      errors: [{ messageId: 'moduleBoundaryViolation' }],
    },
    {
      code: "import { Component } from 'asturian-front';",
      options: [{ depConstraints }],
      filename: '/project/packages/zyra-shared/src/bad-import.ts',
      errors: [{ messageId: 'moduleBoundaryViolation' }],
    },
    {
      code: "import { ServerThing } from 'zyra-server';",
      options: [{ depConstraints }],
      filename: '/project/packages/zyra-shared/src/bad-import.ts',
      errors: [{ messageId: 'moduleBoundaryViolation' }],
    },
  ],
});
