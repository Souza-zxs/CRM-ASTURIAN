#!/usr/bin/env node
// Assistente interativo para criar uma nova marca whitelabel em brands/<slug>/
// sem precisar escrever brand.config.json na mão. Faz as perguntas essenciais,
// valida tudo contra o schema zod de zyra-shared/brand (a mesma fonte da
// verdade usada pelos consumidores TypeScript) e já deixa a pasta assets/
// pronta para receber os arquivos de logo/favicon.
//
// Uso:
//   npx nx build zyra-shared   (uma vez, para o schema ficar resolvível)
//   node scripts/create-brand.mjs
//
// Depois de criado, para testar a marca localmente:
//   ZYRA_BRAND=<slug> node scripts/select-brand.mjs && npm run dev
// E para voltar ao normal antes de commitar:
//   node scripts/select-brand.mjs   (ZYRA_BRAND vazio = volta para "zyra")

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRANDS_DIR = path.join(REPO_ROOT, 'brands');

let brandConfigSchema;
let APP_LOCALES;
try {
  ({ brandConfigSchema } = await import('zyra-shared/brand'));
  ({ APP_LOCALES } = await import('zyra-shared/translations'));
} catch {
  console.error(
    '[create-brand] não consegui carregar o schema de zyra-shared/brand.\n' +
      '  Rode primeiro: npx nx build zyra-shared',
  );
  process.exit(1);
}

const rl = readline.createInterface({ input: stdin, output: stdout });

async function ask(question, { required = false, defaultValue } = {}) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  while (true) {
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    if (answer) return answer;
    if (defaultValue !== undefined) return defaultValue;
    if (!required) return '';
    console.log('  → obrigatório, tente de novo.');
  }
}

async function askHex(question, defaultValue) {
  while (true) {
    const value = await ask(question, { defaultValue });
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    console.log('  → precisa ser uma cor hex de 6 dígitos, ex.: #6e56cf');
  }
}

async function askHttpsUrl(question, { required = false, defaultValue } = {}) {
  while (true) {
    const value = await ask(question, { required, defaultValue });
    if (!value && !required) return value;
    if (value.startsWith('https://')) return value;
    console.log('  → precisa começar com https://');
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('=== Assistente de nova marca whitelabel Zyra ===\n');

  const productName = await ask('Nome do produto (ex.: Acme CRM)', { required: true });
  const suggestedSlug = slugify(productName);
  let slug = slugify(await ask('Slug (identificador único, sem espaços)', { defaultValue: suggestedSlug }));

  const brandDir = path.join(BRANDS_DIR, slug);
  if (existsSync(brandDir)) {
    const overwrite = await ask(
      `brands/${slug}/ já existe. Sobrescrever brand.config.json? (s/N)`,
      { defaultValue: 'n' },
    );
    if (!/^s(im)?$/i.test(overwrite)) {
      console.log('Cancelado.');
      rl.close();
      return;
    }
  }

  const shortName = await ask('Nome curto (para o app/PWA)', { defaultValue: productName });
  const tagline = await ask('Slogan/tagline (opcional)');

  console.log(
    '\nCor principal da marca. Informe só o hex e eu gero uma escala de 12 tons\n' +
      'automaticamente (modo "generated"). Se você já tem uma escala Radix pronta,\n' +
      'edite theme.scale manualmente depois — este assistente cobre o caminho fácil.\n',
  );
  const primaryHex = await askHex('Cor principal (hex)', '#6e56cf');
  const docsPrimaryHex = await ask('Cor principal da documentação (hex, opcional — Enter para usar a mesma)');

  console.log(
    '\nA logo do email precisa estar publicamente acessível via https:// —\n' +
      'clientes de email não carregam imagens locais/bundled.\n',
  );
  const emailLogoUrl = await askHttpsUrl('URL pública da logo (https://...)', { required: true });

  const frontDomain = await ask('Domínio do front (ex.: app.acme.com, opcional)');
  const serverUrl = await askHttpsUrl('URL do servidor/API (https://..., opcional)');
  const defaultSubdomain = await ask('Subdomínio padrão (ex.: app, opcional)');

  const fromName = await ask('Nome do remetente de email', { defaultValue: productName });
  const fromAddress = await ask('Email do remetente (noreply@...)', { required: true });
  const supportAddress = await ask('Email de suporte', { required: true });

  const companyLine = await ask('Linha legal no rodapé (ex.: "Acme CRM — Acme Inc.")', { required: true });
  const websiteUrl = await askHttpsUrl('URL do site institucional (https://..., opcional)');
  const docsUrl = await askHttpsUrl('URL da documentação (https://..., opcional)');

  console.log(
    '\nIdioma padrão para uma visita nova sem preferência salva (ex.: fr-FR, zh-CN, en).\n' +
      'Não afeta o seletor de idioma — todos os ~30 idiomas continuam disponíveis para\n' +
      'qualquer usuário escolher manualmente. Deixe em branco para manter pt-BR.\n',
  );
  let defaultLocale = '';
  while (true) {
    defaultLocale = await ask('Idioma padrão (código de locale, opcional)');
    if (!defaultLocale || defaultLocale in APP_LOCALES) break;
    console.log(`  → locale desconhecido. Válidos: ${Object.keys(APP_LOCALES).join(', ')}`);
  }

  rl.close();

  const config = {
    slug,
    product: {
      name: productName,
      shortName,
      ...(tagline ? { tagline } : {}),
    },
    theme: {
      mode: 'generated',
      primaryHex,
      ...(docsPrimaryHex ? { docsPrimaryHex } : {}),
    },
    assets: {
      emailLogoUrl,
    },
    domain: {
      ...(frontDomain ? { frontDomain } : {}),
      ...(serverUrl ? { serverUrl } : {}),
      ...(defaultSubdomain ? { defaultSubdomain } : {}),
    },
    email: {
      fromName,
      fromAddress,
      supportAddress,
    },
    legal: {
      companyLine,
      ...(websiteUrl ? { websiteUrl } : {}),
      ...(docsUrl ? { docsUrl } : {}),
    },
    ...(defaultLocale ? { defaultLocale } : {}),
  };

  const result = brandConfigSchema.safeParse(config);
  if (!result.success) {
    console.error('\n[create-brand] configuração inválida:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  mkdirSync(brandDir, { recursive: true });
  mkdirSync(path.join(brandDir, 'assets'), { recursive: true });
  writeFileSync(
    path.join(brandDir, 'brand.config.json'),
    JSON.stringify(result.data, null, 2) + '\n',
  );
  writeFileSync(
    path.join(brandDir, 'assets', 'README.md'),
    '# Assets desta marca\n\n' +
      'Coloque aqui os arquivos que você quiser sobrescrever e referencie-os em\n' +
      '`brand.config.json` (`assets.faviconPath`, `assets.appleTouchIconPath`,\n' +
      '`assets.ogImagePath`, `assets.docsLogoPath`, `assets.docsFaviconPath`).\n' +
      'Tudo que não for referenciado aqui mantém o asset padrão da Zyra.\n\n' +
      'Sugestão de arquivos:\n' +
      '- `favicon.png` — quadrado, pelo menos 192x192\n' +
      '- `apple-touch-icon.png` — quadrado, 192x192\n' +
      '- `og-image.png` — 1200x630, usada em previews de link (WhatsApp, redes sociais)\n' +
      '- `docs-logo.svg`\n' +
      '- `docs-favicon.png`\n',
  );

  console.log(`\n✅ Marca "${slug}" criada em brands/${slug}/`);
  console.log('\nPróximos passos:');
  console.log(`  1. (Opcional) solte arquivos em brands/${slug}/assets/ e referencie-os no brand.config.json`);
  console.log(`  2. Pré-visualize:  ZYRA_BRAND=${slug} node scripts/select-brand.mjs && npm run dev`);
  console.log('  3. Antes de commitar, volte para a marca padrão: node scripts/select-brand.mjs');
  console.log(`  4. Para publicar de verdade, use ZYRA_BRAND=${slug} no ambiente de build/deploy (veja packages/zyra-docker/docker-compose.prod.yml).`);
}

main();
