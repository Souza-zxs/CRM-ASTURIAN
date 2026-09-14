import Module from 'module';

// jsdom's dependency tree includes packages that ship ESM-only with no
// "require" export condition (@exodus/bytes, @csstools/css-calc via
// @asamuzakjp/css-color, with more likely to follow as upstream keeps
// modernizing) — require()-ing any of these throws ERR_REQUIRE_ESM and
// crashes the whole process, since jsdom's entire module graph loads
// eagerly the moment anything requires it.
//
// Most of what jsdom pulls in this way genuinely is dead code for this
// app — CSS parsing, computed styles, legacy URL encodings — so the lazy
// stub below (require() "succeeds" with an inert Proxy, only throws if
// something actually calls into it) is the right fix for those. But
// parse5 is not dead code: it's jsdom's actual HTML parser, invoked
// synchronously on every `new JSDOM(...)` call — including the empty-
// string ones this app uses for HTML sanitization (see
// sanitize-file.utils.ts, create-html-to-text-converter.util.ts,
// email-composer.service.ts) — so it can't be lazily stubbed without
// breaking that. `preloadEsmOnlyModuleForRequire` exists for cases like
// this: call it with `await import(...)` results collected up front
// (bootstrap-app.ts does this for 'parse5' before NestFactory.create()
// resolves any provider that transitively `new JSDOM(...)`s), and any
// later synchronous require() of that same specifier returns the real,
// already-loaded module instead of hitting the stub fallback.
const preloadedEsmModules = new Map<string, unknown>();

export const preloadEsmOnlyModuleForRequire = async (
  specifier: string,
): Promise<void> => {
  // A plain `await import(specifier)` here would get compiled by SWC's
  // CommonJS output to `Promise.resolve().then(() => require(specifier))`
  // — still a synchronous require() of an ESM module under the hood, which
  // fails the exact same way this function exists to work around. Building
  // the call from a string via `new Function` hides it from SWC's static
  // analysis, so it survives as a real dynamic import (same technique
  // bootstrap-app.ts uses for graphql-upload).
  const dynamicImport = new Function(
    'specifier',
    'return import(specifier)',
  ) as (specifier: string) => Promise<unknown>;

  preloadedEsmModules.set(specifier, await dynamicImport(specifier));
};

// chalk@5 (pulled in by @e2b/code-interpreter, used only for coloring that
// package's own internal build-log labels) is ESM-only, and on Vercel's
// runtime specifically, requiring it doesn't reliably resolve in a shape
// the SWC/esbuild-compiled call site (`import chalk from 'chalk'` →
// `require("chalk").default`) can use — observed in production as
// `.default` itself being undefined, which no amount of reshaping the real
// require() result can fix without knowing exactly what shape it came back
// in. Since every use of chalk in this codebase's dependency tree is
// cosmetic terminal coloring, side-stepping the real module entirely with
// an inert chainable stub is simpler and strictly more robust than trying
// to repair whatever require("chalk") happens to return on a given
// runtime: `.red`, `.bold.hex('#fff')`, arbitrary chains, and calls all
// just no-op through, and nothing here needs to know or care what shape
// the real export has.
const noopChainable: unknown = new Proxy(function chalkStub() {}, {
  // Deliberately NOT claiming `__esModule: true` here: every CJS/ESM
  // interop helper (esbuild's `__toESM`, SWC/Babel's `_interopRequireDefault`)
  // branches on this flag to decide whether to synthesize a `.default` —
  // truthy tells it "already a real namespace, don't touch it" and it skips
  // that step, which is exactly how the first version of this stub still
  // ended up with `.default` undefined. Leaving it falsy makes every such
  // helper treat this as a plain CJS export and wrap it as `{ default: mod
  // }`, so `.default` always resolves back to this same chainable proxy.
  get: (target, prop) => {
    if (prop === '__esModule') return undefined;
    if (
      prop === Symbol.toPrimitive ||
      prop === 'toString' ||
      prop === 'valueOf'
    ) {
      return () => '';
    }
    if (prop in target) return Reflect.get(target, prop);

    return noopChainable;
  },
  apply: () => noopChainable,
});

// Runs as a side effect of importing this module — must be imported before
// anything that could transitively require() jsdom or @e2b/code-interpreter
// (AppModule's provider graph includes both), so this file needs to be the
// very first import in bootstrap-app.ts, ahead of even NestFactory/AppModule.
const patchNodeRequireForEsmOnlyModules = (): void => {
  const nodeModuleWithLoad = Module as unknown as {
    _load: (
      request: string,
      parent: NodeModule | undefined,
      isMain: boolean,
    ) => unknown;
  };
  const originalLoad = nodeModuleWithLoad._load;

  nodeModuleWithLoad._load = function patchedLoad(
    request,
    parent,
    isMain,
  ): unknown {
    if (request === 'chalk') {
      return noopChainable;
    }

    if (preloadedEsmModules.has(request)) {
      return preloadedEsmModules.get(request);
    }

    try {
      return originalLoad.call(Module, request, parent, isMain);
    } catch (err) {
      if (
        !(err instanceof Error) ||
        (err as NodeJS.ErrnoException).code !== 'ERR_REQUIRE_ESM'
      ) {
        throw err;
      }

      function unavailable(): never {
        throw new Error(
          `"${request}" is ESM-only in this runtime and could not be require()'d — stubbed out lazily by patchNodeRequireForEsmOnlyModules, this only throws because something tried to actually use it`,
        );
      }

      return new Proxy(unavailable, {
        get: (target, prop) => {
          if (prop === '__esModule') return true;
          if (prop in target) return Reflect.get(target, prop);

          return unavailable;
        },
      });
    }
  };
};

patchNodeRequireForEsmOnlyModules();
