// NOT run by the zyra-sdk `build` target (see project.json) — src/cli/operations/build.ts
// imports @/cli/utilities/build/manifest/manifest-writer and
// @/cli/utilities/build/common/typecheck-plugin, neither of which has ever existed in this
// repo's git history (pre-existing gap, not something removed here). The 'cli' and
// 'operations' entries below can't build until those files are implemented. zyra-server
// doesn't need this config's output (it only imports zyra-sdk/define and
// zyra-sdk/front-component, built by the other vite.config.*.ts files), so this step is
// skipped from the build chain rather than blocking the whole zyra-sdk (and therefore
// zyra-server) build.
import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/zyra-sdk-node',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: {
          cli: 'src/cli/cli.ts',
          operations: 'src/cli/operations/index.ts',
        },
        name: 'zyra-sdk',
      },
      rollupOptions: {
        external: (id: string) => {
          if (/^node:/.test(id)) {
            return true;
          }

          const builtins = [
            'child_process',
            'crypto',
            'fs',
            'fs/promises',
            'module',
            'os',
            'path',
            'stream',
            'url',
            'util',
          ];

          if (builtins.includes(id)) {
            return true;
          }

          const deps = Object.keys(
            (packageJson as PackageJson).dependencies || {},
          );

          return deps.some((dep) => id === dep || id.startsWith(dep + '/'));
        },
        output: [
          {
            format: 'es' as const,
            entryFileNames: '[name].mjs',
          },
          {
            format: 'cjs' as const,
            interop: 'auto' as const,
            esModule: true,
            exports: 'named' as const,
            entryFileNames: '[name].cjs',
          },
        ],
      },
    },
    logLevel: 'warn' as const,
  };
});
