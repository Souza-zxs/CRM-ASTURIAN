import path from 'node:path';

import dts from 'rollup-plugin-dts';

// Windows absolute paths (C:\...) start with neither '.' nor '/', so once
// Rollup resolves a relative or workspace import to an absolute filesystem
// path, the old startsWith('/') check misclassified it as an external bare
// import — leaving every local/workspace type unbundled (this is why the
// generated .d.ts files had unresolved './x.ts' and raw absolute-path
// re-exports instead of inlined types).
const external = (id) => {
  if (id === 'zyra-shared' || id.startsWith('zyra-shared/')) {
    return false;
  }
  if (id.startsWith('@/')) {
    return false;
  }
  if (id.startsWith('.') || path.isAbsolute(id)) {
    return false;
  }
  return true;
};

const plugins = [
  dts({
    tsconfig: './tsconfig.lib.json',
    respectExternal: true,
  }),
];

export default [
  {
    input: 'src/sdk/define/index.ts',
    output: { file: 'dist/define/index.d.ts', format: 'es' },
    external,
    plugins,
  },
  {
    input: 'src/sdk/front-component/index.ts',
    output: { file: 'dist/front-component/index.d.ts', format: 'es' },
    external,
    plugins,
  },
  {
    input: 'src/sdk/billing/index.ts',
    output: { file: 'dist/billing/index.d.ts', format: 'es' },
    external,
    plugins,
  },
  {
    input: 'src/sdk/logic-function/index.ts',
    output: { file: 'dist/logic-function/index.d.ts', format: 'es' },
    external,
    plugins,
  },
  {
    input: 'src/sdk/utils/index.ts',
    output: { file: 'dist/utils/index.d.ts', format: 'es' },
    external,
    plugins,
  },
];
