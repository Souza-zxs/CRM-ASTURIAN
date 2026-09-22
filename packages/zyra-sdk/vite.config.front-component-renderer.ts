import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

// Split out of vite.config.node.ts: that config used to bundle this entry
// together with the CLI (`cli`/`operations`), which imports from
// src/cli/utilities/build/* — a directory that was missing from this
// repository (lost to a `.gitignore` bug, since restored) and unrelated to
// this entry. Bundling them in the same Rollup pass meant the CLI's broken
// imports took down this entry too, even though nothing here depends on the
// CLI code. This entry (zyra-sdk/front-component-renderer/build) is a real
// runtime dependency of zyra-front-component-renderer, so it needs to build
// independently of the CLI. See vite.config.node.ts for the cli/operations
// entries.
export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/zyra-sdk-front-component-renderer',
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
          'front-component-renderer/build':
            'src/front-component-renderer/build/index.ts',
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
