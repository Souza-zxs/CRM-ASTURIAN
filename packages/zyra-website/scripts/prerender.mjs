#!/usr/bin/env node
// Static-site generation step: runs after `vite build` (client) and
// `vite build --ssr src/entry-server.tsx` (SSR bundle). Renders every
// locale x route combination to a static HTML file with real <head> tags,
// plus robots.txt and sitemap.xml — replacing what Next's generateStaticParams
// / generateMetadata / app/robots.ts / app/sitemap.ts did.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildPageMetadata,
  fetchLiveMarketplacePartners,
  getIndexedWebsiteRoutes,
  getRobotsDisallowedRoutePaths,
  getSiteUrl,
  localeToUrlSegment,
  render,
  STATIC_WEBSITE_ROUTES,
  WEBSITE_LOCALE_LIST,
} from '../dist-ssr/entry-server.js';

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SOURCE_LOCALE = WEBSITE_LOCALE_LIST[0];

const template = readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

const localeUrlPrefix = (locale) =>
  locale === SOURCE_LOCALE ? '' : `/${localeToUrlSegment(locale)}`;

// The public URL for a (locale, unprefixed route path) pair. Matches the
// path structure App.tsx's router expects: "" | "/:localeSegment" mounted
// ahead of the same route tree.
const publicUrl = (locale, routePath) => {
  const prefix = localeUrlPrefix(locale);
  if (routePath === '/') return prefix === '' ? '/' : prefix;
  return `${prefix}${routePath}`;
};

const outputFilePath = (locale, routePath) => {
  const url = publicUrl(locale, routePath);
  const relative =
    url === '/' ? 'index.html' : `${url.replace(/^\//, '')}/index.html`;
  return path.join(DIST_DIR, relative);
};

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
const absoluteUrl = (metadataBase, urlPath) => `${metadataBase}${urlPath}`;

const buildHeadHtml = (metadata) => {
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${metadata.robots.index ? 'index' : 'noindex'}, ${metadata.robots.follow ? 'follow' : 'nofollow'}" />`,
    `<link rel="canonical" href="${escapeHtml(absoluteUrl(metadata.metadataBase, metadata.alternates.canonical))}" />`,
  ];
  for (const [hreflang, href] of Object.entries(
    metadata.alternates.languages,
  )) {
    tags.push(
      `<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(absoluteUrl(metadata.metadataBase, href))}" />`,
    );
  }
  tags.push(
    `<meta property="og:title" content="${escapeHtml(metadata.openGraph.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.openGraph.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(absoluteUrl(metadata.metadataBase, metadata.openGraph.url))}" />`,
    `<meta property="og:site_name" content="${escapeHtml(metadata.openGraph.siteName)}" />`,
    `<meta property="og:locale" content="${escapeHtml(metadata.openGraph.locale)}" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.openGraph.type)}" />`,
  );
  for (const image of metadata.openGraph.images) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(absoluteUrl(metadata.metadataBase, image.url))}" />`,
    );
  }
  tags.push(
    `<meta name="twitter:card" content="${escapeHtml(metadata.twitter.card)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.twitter.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.twitter.description)}" />`,
    `<meta name="twitter:site" content="${escapeHtml(metadata.twitter.site)}" />`,
    `<meta name="twitter:creator" content="${escapeHtml(metadata.twitter.creator)}" />`,
  );
  for (const image of metadata.twitter.images) {
    tags.push(
      `<meta name="twitter:image" content="${escapeHtml(absoluteUrl(metadata.metadataBase, image))}" />`,
    );
  }
  return tags.join('\n    ');
};

const writePage = ({ locale, routePath, metadata, bodyHtml }) => {
  const filePath = outputFilePath(locale, routePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  const html = template
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace('<!--app-head-->', buildHeadHtml(metadata))
    .replace('<!--app-html-->', bodyHtml);
  writeFileSync(filePath, html);
};

const truncateDescription = (text, max = 160) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max - 1)}…`;
};

const prerenderStaticRoutes = async () => {
  for (const route of STATIC_WEBSITE_ROUTES) {
    const locales = route.localeMode === 'source' ? [SOURCE_LOCALE] : undefined;
    // One-off build script, not a hot path: at most one route in this list
    // matches 'partnersList', so there's nothing to parallelize with
    // Promise.all — this fires (or doesn't) once per prerender run.
    const preloadedPartners =
      route.id === 'partnersList'
        ? // eslint-disable-next-line no-await-in-loop
          await fetchLiveMarketplacePartners()
        : null;

    for (const locale of WEBSITE_LOCALE_LIST) {
      const metadata = buildPageMetadata({
        description: route.description,
        indexed: route.indexed,
        locale,
        locales,
        ogImagePath: route.ogImagePath,
        path: route.path,
        title: route.title,
      });
      const bodyHtml = render(publicUrl(locale, route.path), preloadedPartners);
      writePage({ locale, routePath: route.path, metadata, bodyHtml });
    }
  }
};

const prerenderPartnerProfiles = async () => {
  const partners = await fetchLiveMarketplacePartners();
  for (const partner of partners) {
    const routePath = `/partners/profile/${partner.slug}`;
    for (const locale of WEBSITE_LOCALE_LIST) {
      const metadata = buildPageMetadata({
        description: truncateDescription(partner.introduction),
        locale,
        path: routePath,
        title: `${partner.name} — Zyra Partner`,
      });
      const bodyHtml = render(publicUrl(locale, routePath), partners);
      writePage({ locale, routePath, metadata, bodyHtml });
    }
  }
  return partners.length;
};

const writeRobotsTxt = () => {
  const disallow = ['/api/', ...getRobotsDisallowedRoutePaths()];
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...disallow.map((disallowedPath) => `Disallow: ${disallowedPath}`),
    '',
    `Sitemap: ${getSiteUrl()}/sitemap.xml`,
  ];
  writeFileSync(path.join(DIST_DIR, 'robots.txt'), lines.join('\n'));
};

const writeSitemapXml = () => {
  const siteUrl = getSiteUrl();
  const buildLocalizedUrl = (locale, routePath) =>
    `${siteUrl}${publicUrl(locale, routePath)}`;

  const entries = [];
  for (const route of getIndexedWebsiteRoutes()) {
    const locales =
      route.localeMode === 'source' ? [SOURCE_LOCALE] : WEBSITE_LOCALE_LIST;
    const alternates = [
      ...locales.map(
        (locale) =>
          `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeHtml(buildLocalizedUrl(locale, route.path))}" />`,
      ),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(buildLocalizedUrl(SOURCE_LOCALE, route.path))}" />`,
    ].join('');

    for (const locale of locales) {
      const changeFreq = route.changeFrequency
        ? `<changefreq>${route.changeFrequency}</changefreq>`
        : '';
      entries.push(
        `<url><loc>${escapeHtml(buildLocalizedUrl(locale, route.path))}</loc>${changeFreq}<priority>${route.priority}</priority>${alternates}</url>`,
      );
    }
  }

  // WEBSITE_ROUTE_FAMILY_LIST is empty today (no dynamic content family is
  // indexed yet — partner profiles aren't in the sitemap in the Next version
  // either), so there is nothing else to add here until one registers.

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    entries.join('') +
    '</urlset>';
  writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
};

const main = async () => {
  await prerenderStaticRoutes();
  const partnerCount = await prerenderPartnerProfiles();
  writeRobotsTxt();
  writeSitemapXml();
  rmSync(path.join(ROOT_DIR, 'dist-ssr'), { recursive: true, force: true });

  const pageCount =
    STATIC_WEBSITE_ROUTES.length * WEBSITE_LOCALE_LIST.length +
    partnerCount * WEBSITE_LOCALE_LIST.length;
  // eslint-disable-next-line no-console
  console.log(
    `[prerender] wrote ${pageCount} pages (${partnerCount} partner profiles) + robots.txt + sitemap.xml`,
  );
};

await main();
