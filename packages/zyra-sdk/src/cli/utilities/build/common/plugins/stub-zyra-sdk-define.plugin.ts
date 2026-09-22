import type * as esbuild from 'esbuild';

import * as zyraSdkDefine from '@/sdk/define';

// Everything in zyra-sdk/define is build-time metadata for the manifest
// extractor and is dead code in the user-app bundle. Stubbing it drops zod,
// zyra-shared and ~1MB per logic-function bundle.
//
// Exports are derived from `Object.keys(zyraSdkDefine)` so new ones land
// in the stub automatically; the unit test snapshots the partition.
// Factories must keep the `(config) => ({ config, ... })` shape so the
// manifest extractor can still read `.config`; anything else can be a Proxy.
export const isDefineFactoryExportName = (name: string): boolean =>
  /^define[A-Z]/.test(name) || name === 'createValidationResult';

const partitionDefineExports = (
  mod: Record<string, unknown>,
): { factories: readonly string[]; any: readonly string[] } => {
  const factories: string[] = [];
  const any: string[] = [];

  for (const name of Object.keys(mod).sort()) {
    if (isDefineFactoryExportName(name)) {
      factories.push(name);
    } else {
      any.push(name);
    }
  }

  return { factories, any };
};

export const ZYRA_SDK_DEFINE_STUBBED_EXPORTS = partitionDefineExports(
  zyraSdkDefine as unknown as Record<string, unknown>,
);

const VIRTUAL_NAMESPACE = 'zyra-sdk-define-stub';
const STUB_RESOLVED_PATH = '__zyra-sdk-define-stub__';

const STUB_PRELUDE = `
// Auto-generated stub for zyra-sdk/define injected by the SDK CLI build.
// Real implementations would pull in zod, zyra-shared and ~1MB of code; at
// runtime only \`default.config.handler\` is consumed, so tiny no-ops suffice.
const __defineFactoryStub = (config) => ({
  success: true,
  config,
  errors: [],
});

const __anyHandler = {
  get(_target, prop) {
    if (prop === '__esModule') return true;
    if (prop === Symbol.toPrimitive) return () => '';
    if (typeof prop === 'symbol') return undefined;
    return new Proxy(() => undefined, __anyHandler);
  },
  apply() {
    return new Proxy(() => undefined, __anyHandler);
  },
};
const __anyStub = new Proxy(() => undefined, __anyHandler);
`;

const buildStubModuleSource = (): string => {
  const exportLines: string[] = [];

  for (const name of ZYRA_SDK_DEFINE_STUBBED_EXPORTS.factories) {
    exportLines.push(`export const ${name} = __defineFactoryStub;`);
  }
  for (const name of ZYRA_SDK_DEFINE_STUBBED_EXPORTS.any) {
    exportLines.push(`export const ${name} = __anyStub;`);
  }

  return `${STUB_PRELUDE}\n${exportLines.join('\n')}\n`;
};

export const createStubZyraSdkDefinePlugin = (): esbuild.Plugin => ({
  name: 'zyra-sdk-define-stub',
  setup(build) {
    build.onResolve({ filter: /^zyra-sdk\/define$/ }, () => ({
      path: STUB_RESOLVED_PATH,
      namespace: VIRTUAL_NAMESPACE,
    }));

    build.onLoad({ filter: /.*/, namespace: VIRTUAL_NAMESPACE }, () => ({
      contents: buildStubModuleSource(),
      loader: 'js',
    }));
  },
});
