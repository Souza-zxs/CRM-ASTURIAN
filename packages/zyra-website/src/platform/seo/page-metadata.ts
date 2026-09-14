// The subset of Next's Metadata shape this app actually produces. Consumed
// directly by scripts/prerender.mjs to render <head> tags — there is no
// framework-level metadata API translating this anymore.
export type PageMetadata = {
  alternates: {
    canonical: string;
    languages: Record<string, string>;
  };
  description: string;
  metadataBase: string;
  openGraph: {
    description: string;
    images: readonly { url: string }[];
    locale: string;
    siteName: string;
    title: string;
    type: 'website';
    url: string;
  };
  robots: {
    follow: boolean;
    index: boolean;
  };
  title: string;
  twitter: {
    card: 'summary_large_image';
    creator: string;
    description: string;
    images: readonly string[];
    site: string;
    title: string;
  };
};
