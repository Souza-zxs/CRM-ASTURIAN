import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { beforeAll } from 'vitest';

const CONFIG_DIR = path.join(os.homedir(), '.zyra');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.test.json');

beforeAll(async () => {
  const apiUrl = process.env.ZYRA_API_URL!;
  const token = process.env.ZYRA_API_KEY!;

  if (!apiUrl || !token) {
    throw new Error(
      'ZYRA_API_URL and ZYRA_API_KEY must be set.\n' +
        'Start a local server: yarn zyra docker:start\n' +
        'Or set them in vitest env config.',
    );
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/healthz`);
  } catch {
    throw new Error(
      `Zyra server is not reachable at ${apiUrl}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  }

  if (!response.ok) {
    throw new Error(`Server at ${apiUrl} returned ${response.status}`);
  }

  fs.mkdirSync(CONFIG_DIR, { recursive: true });

  fs.writeFileSync(
    CONFIG_PATH,
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

  process.env.ZYRA_APP_ACCESS_TOKEN ??= token;
});
