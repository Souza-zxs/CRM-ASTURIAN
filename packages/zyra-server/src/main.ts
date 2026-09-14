import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

import { createApp } from './bootstrap-app';

const bootstrap = async () => {
  const app = await createApp();
  const port = app.get(ZyraConfigService).get('NODE_PORT');

  // Bind explicitly to all IPv4 interfaces — some container/orchestrator
  // networking (Railway included) health-checks over IPv4 specifically, and
  // relying on listen()'s default host can end up IPv6-only depending on the
  // environment, making the app unreachable despite running fine.
  await app.listen(port, '0.0.0.0');
};

bootstrap().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
