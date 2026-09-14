import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { ExternalArrow, ExternalLink, VerticalDivider } from '@/ui';

import { type MenuSocialLink } from './menu.data';

const SocialRow = styled.nav`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(5)};
    display: grid;
    grid-auto-flow: column;
    justify-content: end;
  }
`;

const SocialItem = styled.span`
  align-items: center;
  column-gap: ${spacing(5)};
  display: flex;
`;

const SocialAnchor = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: grid;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  grid-auto-flow: column;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export type MenuSocialProps = {
  links: readonly MenuSocialLink[];
};

export function MenuSocial({ links }: MenuSocialProps) {
  const { i18n } = useLingui();
  const desktopLinks = links.filter((link) => link.showInDesktop);

  if (desktopLinks.length === 0) {
    return null;
  }

  return (
    <SocialRow aria-label={i18n._(msg`Comunidade`)}>
      {desktopLinks.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <SocialItem key={link.href}>
            {index > 0 && <VerticalDivider aria-hidden />}
            <SocialAnchor aria-label={i18n._(link.ariaLabel)} href={link.href}>
              <IconComponent aria-hidden size={14} />
              <ExternalArrow />
            </SocialAnchor>
          </SocialItem>
        );
      })}
    </SocialRow>
  );
}
