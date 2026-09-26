// Builds the docs as a static site that Vercel can serve without a Mintlify
// account: copies the docs into a temp folder keeping only the published
// languages, trims docs.json to match, runs `mintlify export` and unzips the
// result into ./dist-static.
//
//   MINTLIFY_BIN=/path/to/mintlify node scripts/build-static.mjs
//
// MINTLIFY_BIN defaults to `npx mintlify` (needs a working install).
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = join(DOCS_ROOT, 'dist-static');
const PUBLISHED_LANGUAGES = ['en', 'pt'];
const CONTENT_DIRS = [
  'getting-started',
  'user-guide',
  'developers',
  'zyra-ui',
  'snippets',
  'images',
];
const ROOT_FILES = ['logo.svg', 'favicon.png', 'custom.css'];

const stage = mkdtempSync(join(tmpdir(), 'zyra-docs-'));

for (const directory of CONTENT_DIRS) {
  if (existsSync(join(DOCS_ROOT, directory))) {
    cpSync(join(DOCS_ROOT, directory), join(stage, directory), {
      recursive: true,
    });
  }
}

for (const file of ROOT_FILES) {
  if (existsSync(join(DOCS_ROOT, file))) {
    cpSync(join(DOCS_ROOT, file), join(stage, file));
  }
}

for (const language of PUBLISHED_LANGUAGES.filter((code) => code !== 'en')) {
  cpSync(join(DOCS_ROOT, 'l', language), join(stage, 'l', language), {
    recursive: true,
  });
}

const config = JSON.parse(readFileSync(join(DOCS_ROOT, 'docs.json'), 'utf8'));
config.navigation.languages = config.navigation.languages.filter((entry) =>
  PUBLISHED_LANGUAGES.includes(entry.language),
);
config.redirects = (config.redirects ?? []).filter(
  (redirect) =>
    !/^\/l\/(?!pt\b)[a-z]{2}\b/.test(redirect.source) &&
    !/^\/l\/(?!pt\b)[a-z]{2}\b/.test(redirect.destination),
);
writeFileSync(
  join(stage, 'docs.json'),
  `${JSON.stringify(config, null, 2)}\n`,
);

const zipPath = join(stage, 'export.zip');
const mintlifyBin = process.env.MINTLIFY_BIN;
const [command, ...baseArguments] =
  mintlifyBin === undefined ? ['npx', 'mintlify'] : ['node', mintlifyBin];

execFileSync(command, [...baseArguments, 'export', '--output', zipPath], {
  cwd: stage,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

rmSync(OUTPUT_DIR, { force: true, recursive: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

// GNU tar (Git Bash) reads "C:\..." as a remote host and cannot open zips, so
// Windows unzips with PowerShell and everything else with unzip.
if (process.platform === 'win32') {
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${OUTPUT_DIR}' -Force`,
    ],
    { stdio: 'inherit' },
  );
} else {
  execFileSync('unzip', ['-q', zipPath, '-d', OUTPUT_DIR], {
    stdio: 'inherit',
  });
}

writeFileSync(
  join(OUTPUT_DIR, 'vercel.json'),
  `${JSON.stringify({ cleanUrls: true, trailingSlash: false }, null, 2)}\n`,
);

rmSync(stage, { force: true, recursive: true });
console.log(`Static docs written to ${OUTPUT_DIR}`);
