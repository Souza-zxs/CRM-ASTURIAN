import { type I18n } from '@lingui/core';
import { type AppLocale } from 'zyra-shared/translations';

import { createI18nInstance } from './create-i18n-instance';
import { setServerI18n } from './get-server-i18n';

// The single call every route render makes (from RootLayout, during render,
// before children render): builds the locale's i18n instance and activates
// it for getServerI18n() to read.
export const activateRouteI18n = (locale: AppLocale): I18n => {
  const i18n = createI18nInstance(locale);
  setServerI18n(i18n);
  return i18n;
};
