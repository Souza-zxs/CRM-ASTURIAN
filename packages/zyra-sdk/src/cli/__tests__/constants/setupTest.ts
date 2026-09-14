import { writeFile } from 'node:fs/promises';
import * as path from 'path';
import { beforeAll } from 'vitest';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';

const testConfigPath = getConfigPath(true);

beforeAll(async () => {
  const apiUrl = process.env.ZYRA_API_URL;
  const token = process.env.ZYRA_API_KEY;

  if (!apiUrl || !token) {
    throw new Error(
      'ZYRA_API_URL and ZYRA_API_KEY must be set.\n' +
        'Run: zyra docker:start --test\n' +
        'Or set them in vitest env config.',
    );
  }

  const response = await fetch(`${apiUrl}/healthz`).catch(() => null);

  if (!response?.ok) {
    throw new Error(
      `Zyra server not reachable at ${apiUrl}. ` +
        'Run: zyra docker:start --test',
    );
  }

  await ensureDir(path.dirname(testConfigPath));

  await writeFile(
    testConfigPath,
    JSON.stringify(
      {
        remotes: {
          local: { apiUrl, apiKey: token },
        },
        defaultRemote: 'local',
      },
      null,
      2,
    ),
  );
});
