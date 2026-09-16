#!/usr/bin/env node
// Selects a white-label brand (ZYRA_BRAND, default "zyra") and applies it
// across the packages that carry brand identity, by overwriting a fixed set
// of tracked source files in place — the same pattern vercel-build-front.sh
// already uses to inject window._env_ into index.html's marked block, just
// applied pre-build so both `npm run dev` and package builds see it.
//
// Selecting the default "zyra" brand is a no-op on a clean checkout, and
// re-running it after testing another brand reverts those files back to
// Zyra's own identity. See brands/README.md.
//
// Deliberately zero npm dependencies beyond what's already hoisted at the
// repo root (only `zod`, and only for parsing — validation here is a small
// hand-rolled check, see the note below) so this can run as the very first
// step of every build script before any package has been built or installed.

import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND_SLUG = process.env.ZYRA_BRAND || 'zyra';
const DEFAULT_BRAND_SLUG = 'zyra';
const BRAND_DIR = path.join(REPO_ROOT, 'brands', BRAND_SLUG);
const CONFIG_PATH = path.join(BRAND_DIR, 'brand.config.json');
const ASSETS_DIR = path.join(BRAND_DIR, 'assets');

function fail(message) {
  console.error(`[select-brand] ${message}`);
  process.exit(1);
}

function loadBrandConfig() {
  if (!existsSync(CONFIG_PATH)) {
    fail(
      `brands/${BRAND_SLUG}/brand.config.json não encontrado. As marcas disponíveis ficam em brands/<slug>/.`,
    );
  }

  let config;
  try {
    config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    fail(`brands/${BRAND_SLUG}/brand.config.json não é um JSON válido: ${error.message}`);
  }

  // Validação completa contra o schema zod em zyra-shared (packages/zyra-shared/src/brand)
  // é deliberadamente evitada aqui: este script roda antes de zyra-shared ser
  // buildado (é o primeiro passo de todo build script), então não pode importar
  // o dist do zyra-shared sem um problema de ordem circular. O schema de
  // zyra-shared/brand continua sendo a fonte da verdade para consumidores
  // TypeScript (ex.: o loader de brand do zyra-emails); isto aqui é um
  // subconjunto mínimo de fail-fast para os campos que este script usa.
  const errors = [];
  if (config.slug !== BRAND_SLUG) {
    errors.push(`o campo slug ("${config.slug}") deve ser igual ao nome do diretório ("${BRAND_SLUG}")`);
  }
  if (!config.product?.name) errors.push('product.name é obrigatório');
  if (!config.theme?.mode || !['generated', 'scale'].includes(config.theme.mode)) {
    errors.push('theme.mode deve ser "generated" ou "scale"');
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(config.theme?.primaryHex || '')) {
    errors.push('theme.primaryHex deve ser uma cor hex de 6 dígitos (usada nas tags meta/manifest/docs theme-color e, quando theme.mode é "generated", como semente da escala)');
  }
  if (config.theme?.mode === 'scale' && BRAND_SLUG !== DEFAULT_BRAND_SLUG && !config.theme.scale) {
    errors.push(
      'theme.scale é obrigatório quando theme.mode é "scale" (só a marca padrão "zyra" pode omitir, significando "não mexer nos arquivos versionados")',
    );
  }
  const emailLogoUrl = config.assets?.emailLogoUrl;
  if (!emailLogoUrl || !emailLogoUrl.startsWith('https://')) {
    errors.push('assets.emailLogoUrl deve ser uma URL https:// absoluta (clientes de email precisam de uma imagem hospedada)');
  }
  if (!config.email?.fromName || !config.email?.fromAddress || !config.email?.supportAddress) {
    errors.push('email.fromName, email.fromAddress e email.supportAddress são todos obrigatórios');
  }
  if (!config.legal?.companyLine) errors.push('legal.companyLine é obrigatório');
  if (
    config.defaultLocale !== undefined &&
    typeof config.defaultLocale !== 'string'
  ) {
    errors.push('defaultLocale, se presente, deve ser uma string (ex.: "fr-FR")');
  }

  if (errors.length > 0) {
    fail(`brands/${BRAND_SLUG}/brand.config.json é inválido:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}

function resolveAsset(relativePath) {
  if (!relativePath) return undefined;
  const resolved = path.join(ASSETS_DIR, relativePath);
  if (!existsSync(resolved)) {
    fail(`brands/${BRAND_SLUG}/assets/${relativePath} referenciado em brand.config.json mas não encontrado`);
  }
  return resolved;
}

function copyAssetOverrides(config) {
  const overrides = [
    // O override de favicon precisa cair em todo arquivo realmente referenciado
    // por <link rel="icon"> no index.html E no alvo de DEFAULT_WORKSPACE_LOGO
    // (usado em runtime por PageFavicon/Logo/componentes do seletor de
    // workspace como fallback de "sem logo próprio") — antes isso só escrevia
    // em favicon.ico, um caminho que nada no app referencia, então o override
    // de favicon da marca era um no-op silencioso.
    [config.assets?.faviconPath, 'packages/asturian-front/public/images/icons/android/android-launchericon-48-48.png'],
    [config.assets?.faviconPath, 'packages/asturian-front/public/images/icons/android/android-launchericon-192-192.png'],
    [config.assets?.faviconPath, 'packages/asturian-front/public/favicon.ico'],
    [config.assets?.appleTouchIconPath, 'packages/asturian-front/public/images/icons/ios/192.png'],
    [config.assets?.ogImagePath, 'packages/asturian-front/public/images/og-image.png'],
    [config.assets?.docsLogoPath, 'packages/zyra-docs/logo.svg'],
    [config.assets?.docsFaviconPath, 'packages/zyra-docs/favicon.png'],
  ];

  for (const [relativeSource, relativeDest] of overrides) {
    if (!relativeSource) continue;
    const source = resolveAsset(relativeSource);
    const dest = path.join(REPO_ROOT, relativeDest);
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(source, dest);
    console.log(`[select-brand] copiado ${relativeSource} -> ${relativeDest}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function patchFrontIndexHtml(config) {
  const indexPath = path.join(REPO_ROOT, 'packages/asturian-front/index.html');
  let html = readFileSync(indexPath, 'utf8');

  const name = escapeHtml(config.product.name);
  const tagline = escapeHtml(config.product.tagline || config.product.name);
  const themeColor = config.theme.primaryHex;

  html = html.replace(/<title>.*?<\/title>/, `<title>${name}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${tagline}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${tagline}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${name}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${tagline}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${name}" />`,
  );
  if (themeColor) {
    html = html.replace(
      /<meta name="theme-color" content=".*?" \/>/,
      `<meta name="theme-color" content="${themeColor}" />`,
    );
  }

  writeFileSync(indexPath, html);
  console.log(`[select-brand] atualizado packages/asturian-front/index.html`);
}

function patchFrontManifest(config) {
  const manifestPath = path.join(REPO_ROOT, 'packages/asturian-front/public/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  manifest.name = config.product.name;
  manifest.short_name = config.product.shortName;
  manifest.theme_color = config.theme.primaryHex;

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[select-brand] atualizado packages/asturian-front/public/manifest.json`);
}

function patchDocsJson(config) {
  const docsJsonPath = path.join(REPO_ROOT, 'packages/zyra-docs/docs.json');
  if (!existsSync(docsJsonPath)) return;

  const docs = JSON.parse(readFileSync(docsJsonPath, 'utf8'));
  docs.name = `${config.product.name} Documentation`;
  docs.colors = {
    ...docs.colors,
    primary: config.theme.docsPrimaryHex || config.theme.primaryHex,
  };
  if (docs.navbar?.primary) {
    docs.navbar.primary.label = `Try ${config.product.name}`;
    if (config.domain.frontDomain) {
      docs.navbar.primary.href = `https://${config.domain.frontDomain}/welcome`;
    }
  }
  if (docs.seo?.metatags && config.legal.docsUrl) {
    docs.seo.metatags.canonical = config.legal.docsUrl;
  }

  writeFileSync(docsJsonPath, JSON.stringify(docs, null, 2) + '\n');
  console.log(`[select-brand] atualizado packages/zyra-docs/docs.json`);
}

// ---------------------------------------------------------------------------
// OKLCH-based 12-step accent scale generation (Björn Ottosson's OKLab, see
// https://bottosson.github.io/posts/oklab/). Self-contained on purpose: this
// script must run before any package (incl. zyra-shared) is built or
// node_modules is fully installed, so it can't depend on a color library.
// ---------------------------------------------------------------------------

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function hexToOklch(hex) {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255);
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255);
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return {
    l: L,
    c: Math.sqrt(a * a + bLab * bLab),
    h: Math.atan2(bLab, a),
  };
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function oklchToHex({ l, c, h }) {
  const a = Math.cos(h) * c;
  const bLab = Math.sin(h) * c;

  const l_ = l + 0.3963377774 * a + 0.2158037573 * bLab;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bLab;
  const s_ = l - 0.0894841775 * a - 1.291485548 * bLab;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  const r = +4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bChan = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  const toByte = (channel) => Math.round(clamp01(linearToSrgb(channel)) * 255);
  const toHexByte = (n) => n.toString(16).padStart(2, '0');

  return `#${toHexByte(toByte(r))}${toHexByte(toByte(g))}${toHexByte(toByte(bChan))}`;
}

// Target lightness per 12-step, approximating a Radix-style scale (light UI
// background -> solid action color at step 9 -> high-contrast text at step
// 12). Chroma is scaled down at both extremes so near-white/near-black steps
// don't look muddy. This is an approximation, not a perceptual-uniformity
// guarantee — brands that need pixel-perfect control should use
// theme.mode: "scale" instead (see brands/README.md).
const LIGHT_STEP_TARGETS = [
  { l: 0.99, chromaScale: 0.06 },
  { l: 0.965, chromaScale: 0.12 },
  { l: 0.92, chromaScale: 0.3 },
  { l: 0.87, chromaScale: 0.45 },
  { l: 0.81, chromaScale: 0.55 },
  { l: 0.74, chromaScale: 0.65 },
  { l: 0.66, chromaScale: 0.8 },
  { l: 0.58, chromaScale: 0.95 },
  null, // step 9 — anchored to the brand's own primaryHex L/C exactly
  { l: 0.5, chromaScale: 1.05 },
  { l: 0.44, chromaScale: 1.0 },
  { l: 0.24, chromaScale: 0.55 },
];

const DARK_STEP_TARGETS = [
  { l: 0.17, chromaScale: 0.35 },
  { l: 0.21, chromaScale: 0.45 },
  { l: 0.27, chromaScale: 0.6 },
  { l: 0.33, chromaScale: 0.75 },
  { l: 0.39, chromaScale: 0.85 },
  { l: 0.46, chromaScale: 0.95 },
  { l: 0.53, chromaScale: 1.0 },
  { l: 0.6, chromaScale: 1.0 },
  null, // step 9 — anchored to the brand's own primaryHex L/C exactly
  { l: 0.68, chromaScale: 1.05 },
  { l: 0.78, chromaScale: 0.9 },
  { l: 0.94, chromaScale: 0.35 },
];

function generateScaleSteps(primary, targets) {
  const steps = targets.map((target) =>
    target === null
      ? oklchToHex(primary)
      : oklchToHex({ l: target.l, c: primary.c * target.chromaScale, h: primary.h }),
  );

  const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12] = steps;
  return {
    primary: s9,
    secondary: s9,
    tertiary: s3,
    quaternary: s2,
    accent3570: s8,
    accent4060: s8,
    accent1: s1,
    accent2: s2,
    accent3: s3,
    accent4: s4,
    accent5: s5,
    accent6: s6,
    accent7: s7,
    accent8: s8,
    accent9: s9,
    accent10: s10,
    accent11: s11,
    accent12: s12,
  };
}

function scaleToTsObject(scale) {
  const entries = Object.entries(scale)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');
  return entries;
}

function writeAccentFile(filePath, exportName, scale) {
  const content = `// Generated by scripts/select-brand.mjs for the "${BRAND_SLUG}" brand.
// Do not hand-edit while a non-default brand is selected — re-run the
// selector (see brands/README.md) instead, or select the "zyra" brand to
// restore Zyra's own hand-tuned Radix-based scale.
export const ${exportName} = {
${scaleToTsObject(scale)}
};
`;
  writeFileSync(filePath, content);
}

function updateDefaultLocale(config) {
  if (!config.defaultLocale) {
    console.log('[select-brand] sem defaultLocale — mantendo DefaultAppLocale.ts intacto');
    return;
  }

  const filePath = path.join(
    REPO_ROOT,
    'packages/asturian-front/src/modules/localization/constants/DefaultAppLocale.ts',
  );
  const content = `// Gerado por scripts/select-brand.mjs para a marca "${BRAND_SLUG}".
// Não edite à mão enquanto uma marca não-padrão estiver selecionada — rode o
// seletor de novo (veja brands/README.md), ou selecione a marca "zyra" para
// restaurar o padrão pt-BR.
import { type APP_LOCALES } from 'zyra-shared/translations';

// Idioma padrão do produto para esta marca. Diferente do SOURCE_LOCALE
// (idioma-fonte do código / fallback de build): este é o locale que novos
// usuários e a tela pré-login assumem quando não há preferência definida
// (nem em localStorage, nem detectável via navigator.language).
export const DEFAULT_APP_LOCALE: keyof typeof APP_LOCALES = '${config.defaultLocale}';
`;

  writeFileSync(filePath, content);
  console.log(`[select-brand] DefaultAppLocale.ts atualizado para "${config.defaultLocale}"`);
}

function updateAccentTheme(config) {
  if (BRAND_SLUG === DEFAULT_BRAND_SLUG && config.theme.mode === 'scale' && !config.theme.scale) {
    console.log('[select-brand] marca padrão — mantendo AccentLight.ts/AccentDark.ts intactos');
    return;
  }

  const lightPath = path.join(
    REPO_ROOT,
    'packages/zyra-ui/src/theme/constants/AccentLight.ts',
  );
  const darkPath = path.join(
    REPO_ROOT,
    'packages/zyra-ui/src/theme/constants/AccentDark.ts',
  );

  let lightScale;
  let darkScale;

  if (config.theme.mode === 'scale') {
    lightScale = config.theme.scale.light;
    darkScale = config.theme.scale.dark;
  } else {
    const primaryLight = hexToOklch(config.theme.primaryHex);
    // Dark mode keeps the same hue but is regenerated from its own step
    // targets rather than reusing the light primary's L/C verbatim, so step 9
    // still reads as a legible "solid" accent against a dark background.
    const primaryDark = { ...primaryLight, l: Math.min(0.75, primaryLight.l + 0.12) };
    lightScale = generateScaleSteps(primaryLight, LIGHT_STEP_TARGETS);
    darkScale = generateScaleSteps(primaryDark, DARK_STEP_TARGETS);
  }

  writeAccentFile(lightPath, 'ACCENT_LIGHT', lightScale);
  writeAccentFile(darkPath, 'ACCENT_DARK', darkScale);
  console.log('[select-brand] AccentLight.ts / AccentDark.ts do zyra-ui regenerados');
}

function writeEnvBrandFile(config) {
  const envPath = path.join(REPO_ROOT, 'packages/zyra-server/.env.brand');
  const lines = [
    `# Generated by scripts/select-brand.mjs for the "${BRAND_SLUG}" brand.`,
    `# Loaded before .env (see environment.module.ts) — do not hand-edit.`,
    `ZYRA_PRODUCT_NAME=${config.product.name}`,
    `ZYRA_PRODUCT_TAGLINE=${config.product.tagline || config.product.name}`,
    `ZYRA_SUPPORT_EMAIL=${config.email.supportAddress}`,
    `ZYRA_LOGO_URL=${config.assets.emailLogoUrl}`,
    `ZYRA_LEGAL_FOOTER_TEXT=${config.legal.companyLine}`,
    `EMAIL_FROM_NAME=${config.email.fromName}`,
    `EMAIL_FROM_ADDRESS=${config.email.fromAddress}`,
  ];
  if (config.domain.serverUrl) lines.push(`SERVER_URL=${config.domain.serverUrl}`);
  if (config.domain.defaultSubdomain) lines.push(`DEFAULT_SUBDOMAIN=${config.domain.defaultSubdomain}`);
  if (config.legal.websiteUrl) lines.push(`ZYRA_WEBSITE_URL=${config.legal.websiteUrl}`);
  if (config.legal.docsUrl) lines.push(`ZYRA_DOCS_URL=${config.legal.docsUrl}`);

  writeFileSync(envPath, lines.join('\n') + '\n');
  console.log('[select-brand] arquivo packages/zyra-server/.env.brand gerado');
}

function main() {
  const config = loadBrandConfig();
  console.log(`[select-brand] aplicando a marca "${BRAND_SLUG}" (${config.product.name})`);

  copyAssetOverrides(config);
  patchFrontIndexHtml(config);
  patchFrontManifest(config);
  patchDocsJson(config);
  updateAccentTheme(config);
  updateDefaultLocale(config);
  writeEnvBrandFile(config);

  console.log(`[select-brand] concluído`);
}

main();
