// NOT run by the zyra-sdk `build` target (see project.json) — it's only wired into
// `build:cli` (packaging the `zyra` CLI binary). src/cli/operations/build.ts and the rest
// of src/cli/utilities/build/* were recovered after being lost to a `.gitignore` bug (an
// unscoped `build` glob swallowed these source directories; see the fix in the root
// .gitignore). zyra-server doesn't need this config's output (it only imports
// zyra-sdk/define and zyra-sdk/front-component, built by the other vite.config.*.ts
// files), so this step stays out of the main build chain and only runs for `build:cli`.
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
        // cli/operations import from src/cli/utilities/build/*, recovered
        // after the .gitignore bug described above. See
        // vite.config.front-component-renderer.ts, which used to share
        // this file and now builds independently.
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
