import { z } from 'zod';

import { APP_LOCALES } from '@/translations/constants/AppLocales';

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), {
    message: 'must be an absolute https:// URL (required for email clients)',
  });

const accentScaleSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  tertiary: z.string(),
  quaternary: z.string(),
  accent3570: z.string(),
  accent4060: z.string(),
  accent1: z.string(),
  accent2: z.string(),
  accent3: z.string(),
  accent4: z.string(),
  accent5: z.string(),
  accent6: z.string(),
  accent7: z.string(),
  accent8: z.string(),
  accent9: z.string(),
  accent10: z.string(),
  accent11: z.string(),
  accent12: z.string(),
});

export const brandConfigSchema = z.object({
  slug: z.string().min(1),
  product: z.object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    tagline: z.string().optional(),
  }),
  theme: z.object({
    mode: z.enum(['generated', 'scale']),
    // always required: the representative brand color used for meta/manifest
    // theme-color tags and docs.json, and (when mode is "generated") the seed
    // a full 12-step light/dark UI scale gets derived from
    primaryHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    // optional override for docs.json's primary color, which is
    // intentionally a different (usually neutral) color from the in-app
    // accent in Zyra's own brand — falls back to primaryHex when omitted
    docsPrimaryHex: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    // required when mode is "scale" — a hand-tuned scale, used verbatim
    scale: z
      .object({
        light: accentScaleSchema,
        dark: accentScaleSchema,
      })
      .optional(),
  }),
  assets: z.object({
    // relative to this brand's assets/ dir; each is an optional single-file
    // override — omitted ones fall back to the zyra default already in place
    faviconPath: z.string().optional(),
    appleTouchIconPath: z.string().optional(),
    ogImagePath: z.string().optional(),
    docsLogoPath: z.string().optional(),
    docsFaviconPath: z.string().optional(),
    // must already be hosted somewhere public — email clients can't load
    // bundled local assets
    emailLogoUrl: httpsUrlSchema,
  }),
  domain: z.object({
    frontDomain: z.string().optional(),
    serverUrl: z.string().url().optional(),
    defaultSubdomain: z.string().optional(),
  }),
  // Idioma padrão desta marca (ex.: "fr-FR", "zh-CN") — o que uma visita nova
  // sem preferência salva e sem locale de navegador reconhecido vai ver.
  // Omitido = mantém o padrão atual da Zyra (pt-BR); não afeta o seletor de
  // idioma em si (todos os ~30 idiomas do Lingui continuam disponíveis para
  // qualquer usuário escolher manualmente, independente da marca).
  defaultLocale: z
    .string()
    .refine((value) => value in APP_LOCALES, {
      message: `deve ser um dos idiomas suportados: ${Object.keys(APP_LOCALES).join(', ')}`,
    })
    .optional(),
  email: z.object({
    fromName: z.string().min(1),
    fromAddress: z.string().email(),
    supportAddress: z.string().email(),
  }),
  legal: z.object({
    companyLine: z.string().min(1),
    websiteUrl: z.string().url().optional(),
    docsUrl: z.string().url().optional(),
    socialLinks: z.record(z.string(), z.string().url()).optional(),
  }),
});

export type BrandConfig = z.infer<typeof brandConfigSchema>;
export type BrandAccentScale = z.infer<typeof accentScaleSchema>;

export const DEFAULT_BRAND_SLUG = 'zyra';
