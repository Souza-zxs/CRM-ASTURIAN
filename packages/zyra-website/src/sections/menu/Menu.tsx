'use client';

import { Drawer } from '@base-ui/react/drawer';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';

import { ZyraLogo } from '@/icons';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { MENU_STYLE_BACKGROUND_VAR, useMenuStyle } from '@/platform/menu-style';
import {
  SHADOW,
  EASING,
  buildSchemeDeclarations,
  color,
  mediaUp,
  type Scheme,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';
import { Button, Container, IconButton } from '@/ui';

import { CloseDrawerOnDesktopEffect } from './CloseDrawerOnDesktopEffect';
import { MENU } from './menu.data';
import { MenuDrawer } from './MenuDrawer';
import { MenuNav } from './MenuNav';
import { MenuSocial } from './MenuSocial';
import { ScrollStateEffect } from './ScrollStateEffect';

// Safari < 18 still needs the -webkit- prefix for backdrop-filter.
const headerClassName = css`
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: var(${MENU_STYLE_BACKGROUND_VAR}, ${semanticColor.surface});
  color: ${semanticColor.ink};
  position: sticky;
  top: 0;
  transition: box-shadow 0.2s ${EASING.gentle};
  width: 100%;
  z-index: ${Z_INDEX.stickyHeader};

  &[data-scheme='light'] {
    ${buildSchemeDeclarations('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }

  &[data-elevated] {
    box-shadow: ${SHADOW.header};
  }

  /* A scroll-driven page (the product hero) interpolates its own
     background; blur over the moving wipe reads as smearing. */
  &[data-blur-suppressed] {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
`;

const MenuRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(5)};
  justify-content: space-between;
  min-height: 64px;
`;

const LogoLink = styled(LocalizedLink)`
  display: grid;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const DesktopActions = styled.div`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    display: flex;
    gap: ${spacing(2)};
  }
`;

const MobileActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};

  ${mediaUp('md')} {
    display: none;
  }
`;

export type MenuProps = {
  scheme?: Scheme;
};

export function Menu({ scheme = 'light' }: MenuProps) {
  const { i18n } = useLingui();
  const menuStyle = useMenuStyle();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const resolvedScheme = menuStyle.scheme ?? scheme;

  const handleScrollStateChange = useCallback(
    (hasScrolled: boolean, isScrolling: boolean) => {
      setIsElevated(hasScrolled || isScrolling);
    },
    [],
  );

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <CloseDrawerOnDesktopEffect onClose={closeDrawer} />
      <ScrollStateEffect onScrollStateChange={handleScrollStateChange} />
      <header
        className={headerClassName}
        data-blur-suppressed={menuStyle.suppressBackdropBlur ? '' : undefined}
        data-elevated={
          isElevated && !menuStyle.suppressElevation ? '' : undefined
        }
        data-scheme={resolvedScheme}
      >
        <Container>
          <MenuRow>
            <Drawer.Close
              nativeButton={false}
              render={<LogoLink aria-label={i18n._(msg`Início`)} href="/" />}
            >
              <ZyraLogo sizePx={40} />
            </Drawer.Close>
            <MenuNav items={MENU.navItems} />
            <MenuSocial links={MENU.socialLinks} />
            <DesktopActions>
              <Button
                href={MENU.appLoginUrl}
                label={i18n._(msg`Entrar`)}
                size="small"
                variant="outlined"
              />
              <Button
                href={MENU.appSignUpUrl}
                label={i18n._(msg`Começar agora`)}
                size="small"
              />
            </DesktopActions>
            <MobileActions>
              <Button
                href={MENU.appSignUpUrl}
                label={i18n._(msg`Começar agora`)}
              />
              <IconButton
                ariaLabel={
                  isDrawerOpen
                    ? i18n._(msg`Fechar menu`)
                    : i18n._(msg`Abrir menu`)
                }
                onClick={() => setIsDrawerOpen((previous) => !previous)}
              >
                {isDrawerOpen ? (
                  <IconX size={16} stroke={1.6} />
                ) : (
                  <IconMenu2 size={16} stroke={1.6} />
                )}
              </IconButton>
            </MobileActions>
          </MenuRow>
        </Container>
      </header>
      <MenuDrawer
        scheme={resolvedScheme}
        navItems={MENU.navItems}
        socialLinks={MENU.socialLinks}
      />
    </Drawer.Root>
  );
}
