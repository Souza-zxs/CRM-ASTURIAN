import { type PageLayoutTabManifest } from 'zyra-shared/application';

export type PageLayoutTabConfig = Omit<
  PageLayoutTabManifest,
  'pageLayoutUniversalIdentifier'
> & {
  pageLayoutUniversalIdentifier: string;
};
