'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  fontFamily,
  fontSize,
  FONT_WEIGHT,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import { PARTNER_APPLICATION_COPY } from '../partner-application-copy';

const SuccessView = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Dismiss = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  padding: 0;
  text-transform: uppercase;
`;

export function PartnerApplicationSuccess({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const { i18n } = useLingui();

  return (
    <>
      <Heading as="h2" size="lg" weight="light">
        {i18n._(PARTNER_APPLICATION_COPY.successTitle)}
      </Heading>
      <SuccessView>
        <Body muted size="md">
          {i18n._(PARTNER_APPLICATION_COPY.successSubtitle)}
        </Body>
        <Dismiss onClick={onDismiss} type="button">
          {i18n._(PARTNER_APPLICATION_COPY.dismiss)}
        </Dismiss>
      </SuccessView>
    </>
  );
}
