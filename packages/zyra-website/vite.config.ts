import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const LINGUI_SWC_PLUGIN_OPTIONS = {
  runtimeModules: {
    i18n: ['@lingui/core', 'i18n'],
    trans: ['@lingui/react', 'Trans'],
  },
};

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/zyra-website',

  server: {
    port: 3002,
  },

  plugins: [
    react({
      plugins: [['@lingui/swc-plugin', LINGUI_SWC_PLUGIN_OPTIONS]],
    }),
    tsconfigPaths({
      root: __dirname,
      projects: ['tsconfig.json'],
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
    wyw({
      include: [path.resolve(__dirname, 'src') + '/**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-export-namespace-from'],
      },
    }),
  ],

  build: {
    outDir: 'dist',
    sourcemap: false,
  },

  define: {
    // getSiteUrl() (src/platform/seo/get-site-url.ts) reads this in both the
    // browser bundle and the Node-run prerender script; Node sees the real
    // process.env, the browser gets it inlined at build time here.
    'process.env.NEXT_PUBLIC_WEBSITE_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_WEBSITE_URL ?? '',
    ),
  },

  resolve: {
    alias: [
      // wyw-in-js resolves modules in its CSS evaluator via vite's
      // resolve.alias (it does not pick up vite-tsconfig-paths), so the `@/`
      // tsconfig path alias must be mirrored here.
      { find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` },
    ],
  },
});
