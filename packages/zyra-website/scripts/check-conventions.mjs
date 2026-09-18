import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const sourceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
);

// Next.js route files are framework contracts: they require default exports
// and may export route config alongside (metadata, generateStaticParams...).
const NEXT_CONTRACT_FILES = new Set([
  'default.tsx',
  'error.tsx',
  'forbidden.tsx',
  'global-error.tsx',
  'layout.tsx',
  'loading.tsx',
  'manifest.ts',
  'not-found.tsx',
  'opengraph-image.tsx',
  'page.tsx',
  'robots.ts',
  'route.ts',
  'sitemap.ts',
  'template.tsx',
  'unauthorized.tsx',
]);

// Vite's own entry-point convention (referenced by name in index.html and
// vite.config.ts) — lowercase, not a casing violation to fix by renaming.
const VITE_ENTRY_FILES = new Set(['main.tsx', 'entry-server.tsx']);

// The one-value-export-per-file rule assumes components/logic, where a split
// is free. These four are cohesive pairs where splitting would cost more
// than it buys: a getter/setter over the same module-private state, a
// Context with its co-located consumer hook (the idiomatic React pairing),
// two config constants that are only ever imported together to build one
// URL, and the site's single global stylesheet (font-faces + base reset —
// the equivalent of the old app/[locale]/layout.tsx's globals.css).
const VALUE_EXPORT_ALLOWLIST = new Set([
  'src/platform/i18n/get-server-i18n.ts',
  'src/platform/ssg/PreloadedPartnersContext.tsx',
  'src/funnel/config.ts',
  'src/routes/global-styles.ts',
]);

const VALUE_EXPORT_PATTERN =
  /^export (?:const|let|function|async function|class) /gm;
const DEFAULT_EXPORT_PATTERN = /^export default /m;
const REEXPORT_STATEMENT_PATTERN =
  /export (?:type )?\{[\s\S]*?\} from '[^']+';|export \* from '[^']+';/g;

const failures = [];

// This check used to read src/platform/routing/locale-rewrite-patterns.ts —
// a file that doesn't exist anywhere in this repo's git history (which has
// only a single squashed "initial snapshot" commit), so the check crashed
// with ENOENT on every run instead of ever actually validating anything.
// The mechanism it protected (a server-side /fr/* locale rewrite that could
// 404 a public/ asset whose top segment wasn't reserved) no longer applies:
// this site has no server-side locale detection or rewrite config (see the
// migration note in src/App.tsx and the absence of any rewrite in
// vercel.json) — locale routing is client-side only, via :localeSegment in
// react-router, which never intercepts real static asset requests. Removed
// rather than reconstructed with a guessed RESERVED_PREFIXES list, since a
// fabricated allowlist would give false confidence without checking anything
// real — the same failure mode that shipped the zyra-icons.com/
// zyra-companies.com dead domains elsewhere in this fork.

// Color and easing literals live only in src/tokens (comments stripped
// before matching). Authored one-offs are allowlisted with their reason.
const LITERAL_ALLOWLIST = new Set([
  // Error copy on the funnel's light-scheme SectionShell. The palette's only
  // `error` token (#ff9a9a) is documented as tuned for dark application
  // surfaces — using it here would fail contrast on a light background.
  // Needs a light-surface error token before this can move to src/tokens.
  'src/funnel/SignupPageView.tsx',
]);
// Files allowed to set the new-tab security attributes themselves.
const EXTERNAL_LINK_OWNERS = new Set([
  'src/ui/ExternalLink.tsx',
  'src/ui/Button.tsx',
]);

// Owned vector glyphs are React components in src/icons — never .svg
// files in public/. Files here are third-party brand assets the site can
// only serve by URL (plus zyra.svg, the data layer's static export of
// src/icons/zyra-logo.tsx for the mockup's brand-image-by-URL path).
const PUBLIC_SVG_BRAND_FILES = new Set([
  'public/images/logo-bar/otiima.svg',
  'public/images/logo-bar/civicactions.svg',
  'public/images/logo-bar/fora.svg',
  'public/images/logo-bar/wazoku.svg',
  'public/images/shared/companies/logos/linear.svg',
  'public/images/shared/companies/logos/zyra.svg',
  // The halftone studio's default image input: fetched at runtime as an
  // <img> and fed through the halftone shader, not rendered as an icon glyph.
  'public/images/shared/halftone/zyra-logo.svg',
]);
// Root README documentation assets: the repo's top-level README.md embeds
// these SVGs by URL. They are not site UI (so not src/icons components) nor
// third-party brand marks — they live here only so the README's relative
// paths keep resolving once this package takes over the zyra-website
// public/ path. A trailing slash matches a whole directory.
const PUBLIC_SVG_README_DOC_PATHS = [
  'public/images/core/logo.svg',
  'public/images/readme/',
];
// Vertical rhythm rides margins ('& > * + *'), not row-gap: gap breaks
// silently when a wrapper changes the child list. row-gap is allowed only
// where layout is genuinely multi-axis (wrapping rows, multi-column
// tracks) — listed here explicitly.
const ROW_GAP_MULTI_AXIS_FILES = new Set([
  'sections/case-study-detail/CaseStudyHero.tsx',
  'sections/faq/Faq.tsx',
  'sections/faq/FaqItems.tsx',
  'sections/pricing-plans/PricingBoard.tsx',
  'sections/problem/Problem.tsx',
  'sections/releases-feed/ReleasesFeed.tsx',
  'sections/stepper/ProductStepper.tsx',
  'sections/stepper/Stepper.tsx',
  'sections/testimonials/PartnerTestimonialsCarousel.tsx',
  'sections/testimonials/TestimonialsCarousel.tsx',
  'sections/trusted-by/TrustedBy.tsx',
  'sections/why-zyra-editorial/Editorial.tsx',
]);

const LITERAL_PATTERNS = [
  [/#[0-9a-fA-F]{3,8}\b/, 'hex color literal'],
  [/rgba?\(/, 'rgb/rgba literal'],
  [/cubic-bezier\(/, 'cubic-bezier literal'],
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // oxfmt silently ignores directories named "lib" (build-output
      // convention), so a lib/ directory would dodge formatting forever.
      // src/locales/generated is the one sanctioned exception: it is the
      // lingui compile output the shared CI regenerates, and oxfmt ignoring
      // machine-generated catalogs is exactly what we want there.
      const isLocalesGenerated =
        entry.name === 'generated' && path.basename(directory) === 'locales';
      if (
        entry.name === 'lib' ||
        (entry.name === 'generated' && !isLocalesGenerated)
      ) {
        failures.push(
          `${fullPath}: directories named "lib" or "generated" are forbidden (oxfmt ignores them).`,
        );
      }
      walk(fullPath);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(sourceRoot, fullPath);
    const posixPath = relativePath.split(path.sep).join('/');

    if (
      (posixPath.startsWith('ui/') || posixPath.startsWith('sections/')) &&
      /row-gap:/.test(content) &&
      !ROW_GAP_MULTI_AXIS_FILES.has(posixPath)
    ) {
      failures.push(
        `src/${relativePath}: row-gap in a flow stack — use '& > * + * { margin-top: … }' (mind: unlike gap, the margin shifts absolutely-positioned non-first children; allowlist the file if the layout is genuinely multi-axis).`,
      );
    }

    // The global * reset (layout.tsx) already zeroes every element's margin,
    // so a component's own 'margin: 0' is redundant — and it ties with the
    // owl rhythm ('& > * + * { margin-top }', equal specificity), silently
    // collapsing the gap by source order (this broke a heading once). Cancel
    // an owl gap deliberately with the specific 'margin-top: 0' instead.
    if (
      posixPath !== 'routes/global-styles.ts' &&
      // The /halftone generator bakes standalone HTML whose own '* { margin: 0 }'
      // reset is required — the downloaded file has no global reset to inherit.
      !posixPath.startsWith('platform/visuals/halftone-studio/') &&
      !relativePath.includes('.test.') &&
      /^[ \t]*margin:[ \t]*0;[ \t]*$/m.test(content)
    ) {
      failures.push(
        `src/${relativePath}: redundant 'margin: 0' — the global * reset zeroes margins and it ties with the owl rhythm; remove it (use 'margin-top: 0' to deliberately cancel an owl gap).`,
      );
    }

    if (
      !relativePath.startsWith('tokens' + path.sep) &&
      // The /halftone generator is a standalone color/shader tool: hex + rgba
      // colors and cubic-bezier eases are its domain values (and what it
      // exports), not design-system tokens.
      !posixPath.startsWith('platform/visuals/halftone-studio/') &&
      !relativePath.includes('.test.') &&
      !LITERAL_ALLOWLIST.has(`src/${posixPath}`)
    ) {
      const withoutComments = content
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [pattern, label] of LITERAL_PATTERNS) {
        if (pattern.test(withoutComments)) {
          failures.push(
            `src/${relativePath}: ${label} outside src/tokens — use a token.`,
          );
        }
      }
    }

    // Breakpoints exist only through mediaUp(); a raw width query bypasses
    // the breakpoint tokens (reduced-motion and print queries are fine).
    if (
      !relativePath.startsWith('tokens' + path.sep) &&
      /@media \((?:min|max)-width/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: raw width @media query — use mediaUp().`,
      );
    }

    if (
      !EXTERNAL_LINK_OWNERS.has(`src/${posixPath}`) &&
      /target="_blank"|noopener/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: new-tab attributes belong to ui/ExternalLink — compose it.`,
      );
    }

    // Screen-reader strings are user-facing: a11y attributes must be
    // localized, never string literals.
    if (
      (relativePath.startsWith('sections' + path.sep) ||
        relativePath.startsWith('case-studies' + path.sep) ||
        relativePath.startsWith('app-preview' + path.sep) ||
        relativePath.startsWith('contact-cal' + path.sep) ||
        relativePath.startsWith('partner-application' + path.sep) ||
        relativePath.startsWith('partners-marketplace' + path.sep) ||
        relativePath.startsWith('pricing-state' + path.sep)) &&
      /(?:aria-label|ariaLabel|aria-roledescription|placeholder|alt)="[A-Za-z]/.test(
        content,
      )
    ) {
      failures.push(
        `src/${relativePath}: untranslated a11y string literal — wrap in i18n._(msg\`...\`).`,
      );
    }

    // Sections are islands: importing another section couples compositions
    // that must evolve independently. Shared shapes live in ui/icons/platform.
    if (relativePath.startsWith('sections' + path.sep)) {
      const ownSection = relativePath.split(path.sep)[1];
      const crossImport = [...content.matchAll(/from '@\/sections\/([a-z-]+)/g)]
        .map((m) => m[1])
        .find((section) => section !== ownSection);
      if (crossImport) {
        failures.push(
          `src/${relativePath}: imports from sections/${crossImport} — sections may not import each other.`,
        );
      }
    }

    // Shared composite layers (the product mockup, the contact modal) sit
    // between sections and primitives: multiple sections consume them, so
    // they may reach only the pure and platform layers, never sections.
    const sharedLayer = [
      'app-preview',
      'case-studies',
      'contact-cal',
      'partner-application',
      'partners-marketplace',
      'pricing-state',
    ].find((layer) => relativePath.startsWith(layer + path.sep));
    if (sharedLayer) {
      const allowedLayers = new Set([
        'tokens',
        'icons',
        'ui',
        'platform',
        sharedLayer,
      ]);
      const forbiddenLayer = [...content.matchAll(/from '@\/([a-z-]+)/g)]
        .map((m) => m[1])
        .find((layer) => !allowedLayers.has(layer));
      if (forbiddenLayer) {
        failures.push(
          `src/${relativePath}: ${sharedLayer} may import only tokens/icons/ui/platform, found @/${forbiddenLayer}.`,
        );
      }
    }

    // zyra-ui's theme is pure data, baked by Linaria at build time — consume
    // it directly so the mockups can't drift from the product. Its components
    // are React runtime (+ react-tooltip): importing them would weigh down the
    // marketing bundle, so the mockups stay on lean primitives built against
    // the theme.
    const badZyraUiSubpath = [
      ...content.matchAll(/from 'zyra-ui(\/[a-z-]+)?'/g),
    ]
      .map((match) => match[1] ?? '')
      .find(
        (subpath) => subpath !== '/theme' && subpath !== '/theme-constants',
      );
    if (badZyraUiSubpath !== undefined) {
      failures.push(
        `src/${relativePath}: only zyra-ui/theme is importable (pure data, baked at build); zyra-ui${badZyraUiSubpath} pulls React runtime into the bundle — build a lean primitive instead.`,
      );
    }

    // three is heavy (~150KB gz): only the visuals heavy zones may value-
    // import it, reached exclusively via the rigs' dynamic imports — the
    // bundle boundary as a build invariant. (halftone-studio is the standalone
    // /halftone generator tool, dynamic-imported on its own code-split route.)
    if (
      !/^platform\/visuals\/(three-runtime|halftone|halftone-studio)\//.test(
        relativePath.split(path.sep).join('/'),
      ) &&
      /^import (?!type )[^;]*from 'three/m.test(content)
    ) {
      failures.push(
        `src/${relativePath}: value-imports three outside platform/visuals heavy zones (use "import type" for types).`,
      );
    }

    // tokens and icons are pure: no client runtime.
    if (
      (relativePath.startsWith('tokens' + path.sep) ||
        relativePath.startsWith('icons' + path.sep)) &&
      content.includes("'use client'")
    ) {
      failures.push(`src/${relativePath}: 'use client' in a pure layer.`);
    }

    // .tsx files are PascalCase (named after their React component); .ts
    // files are kebab-case. Test files mirror their subject's name, so the
    // .test infix is stripped before the casing rule (TagInput.test.tsx,
    // partner-fields.test.ts) — matching the .test-only exemptions elsewhere.
    // Next.js route files (page/layout/...) and the compiled locale catalogs
    // are exempt.
    if (
      !NEXT_CONTRACT_FILES.has(entry.name) &&
      !VITE_ENTRY_FILES.has(entry.name) &&
      !relativePath.startsWith('locales' + path.sep)
    ) {
      const nameForCasing = entry.name.replace(/\.test(?=\.[tj]sx?$)/, '');
      if (nameForCasing.endsWith('.tsx')) {
        if (!/^[A-Z][A-Za-z0-9]*\.tsx$/.test(nameForCasing)) {
          failures.push(`src/${relativePath}: .tsx filenames are PascalCase.`);
        }
      } else if (/[A-Z]/.test(nameForCasing)) {
        failures.push(`src/${relativePath}: .ts filenames are kebab-case.`);
      }
    }

    // SectionShell is the only owner of <section>: it is where vertical
    // rhythm and surface schemes live, so no other file may create one.
    if (
      relativePath !== path.join('ui', 'SectionShell.tsx') &&
      /<section[\s>]|styled\.section/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: <section> may only be rendered by ui/SectionShell.tsx.`,
      );
    }
    const isNextContractFile =
      relativePath.startsWith('app' + path.sep) &&
      NEXT_CONTRACT_FILES.has(entry.name);

    if (isNextContractFile) continue;

    // The module-shape rules are line-anchored and must not read inside
    // template literals (mock source-code fiction contains export lines).
    const withoutTemplateLiterals = content.replace(/`[\s\S]*?`/g, '``');

    if (DEFAULT_EXPORT_PATTERN.test(withoutTemplateLiterals)) {
      failures.push(
        `src/${relativePath}: default export outside a Next.js route file (use named exports).`,
      );
    }

    if (entry.name === 'index.ts') {
      const withoutReexports = content
        .replace(REEXPORT_STATEMENT_PATTERN, '')
        .replace(/\/\/[^\n]*/g, '');
      if (/\S/.test(withoutReexports)) {
        failures.push(
          `src/${relativePath}: barrels may only re-export (found: ${withoutReexports.trim().split('\n')[0]}).`,
        );
      }
      continue;
    }

    const valueExportCount = (
      withoutTemplateLiterals.match(VALUE_EXPORT_PATTERN) ?? []
    ).length;
    if (
      valueExportCount > 1 &&
      !VALUE_EXPORT_ALLOWLIST.has(`src/${posixPath}`)
    ) {
      failures.push(
        `src/${relativePath}: ${valueExportCount} value exports (limit is one per file).`,
      );
    }
  }
}

walk(sourceRoot);

// Public SVG audit: any .svg outside the brand-file allowlist means an
// owned glyph leaked out of src/icons.
const publicSvgs = [];
const walkPublic = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPublic(fullPath);
    else if (entry.name.endsWith('.svg')) publicSvgs.push(fullPath);
  }
};
walkPublic('public');
for (const rawSvgPath of publicSvgs) {
  // Allowlists below are written with forward slashes; path.join() uses the
  // OS separator, so on Windows this string would never match without
  // normalizing first (every entry would look like a leaked glyph).
  const svgPath = rawSvgPath.split(path.sep).join('/');
  const isReadmeDocAsset = PUBLIC_SVG_README_DOC_PATHS.some((allowed) =>
    allowed.endsWith('/') ? svgPath.startsWith(allowed) : svgPath === allowed,
  );
  if (!PUBLIC_SVG_BRAND_FILES.has(svgPath) && !isReadmeDocAsset) {
    failures.push(
      `${svgPath}: owned vector glyphs are components in src/icons — public/ svg files are third-party brand assets only (or add to PUBLIC_SVG_BRAND_FILES with a reason).`,
    );
  }
}

if (failures.length > 0) {
  console.error('check-conventions: FAILED');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('check-conventions: OK');
