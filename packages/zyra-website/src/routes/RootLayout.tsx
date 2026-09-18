import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { ContactCalModalRoot } from '@/contact-cal';
import {
  activateRouteI18n,
  getLocaleMessages,
  I18nProvider,
  resolveLocaleSegment,
} from '@/platform/i18n';
import { tokenCssVariables } from '@/tokens';

import { fontFaceStyles, globalStyles } from './global-styles';

// The root of every route: resolves the active locale from the optional
// :localeSegment param, activates it for getServerI18n() (read by section
// components that aren't hooked into useLingui()) before any child renders,
// and provides the client i18n context. Mounted twice in App.tsx — once at
// "/" for the unprefixed source locale, once at "/:localeSegment" for the
// others — so both branches share this one implementation.
export const RootLayout = () => {
  const { localeSegment } = useParams<{ localeSegment?: string }>();
  const locale = resolveLocaleSegment(localeSegment);
  activateRouteI18n(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className={`${tokenCssVariables} ${globalStyles} ${fontFaceStyles}`}>
      <I18nProvider locale={locale} messages={getLocaleMessages(locale)}>
        <ContactCalModalRoot>
          <Outlet />
        </ContactCalModalRoot>
      </I18nProvider>
    </div>
  );
};
