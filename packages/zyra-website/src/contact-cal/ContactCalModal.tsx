'use client';

import { Dialog } from '@base-ui/react/dialog';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { lazy } from 'react';

import { ClientOnly } from '@/platform/client-only';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  spacing,
} from '@/tokens';
import { Modal } from '@/ui';

import { CONTACT_CAL_FORM_CAL_LINK } from './contact-cal-config';

const Title = styled.h2`
  color: ${color('white')};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(10)};
  font-weight: ${FONT_WEIGHT.light};
  line-height: ${fontSize(11.5)};

  ${mediaUp('md')} {
    font-size: ${fontSize(12)};
    line-height: ${fontSize(14)};
  }
`;

const EmbedShell = styled.div`
  min-height: 400px;
  width: 100%;
`;

const EmbedFallback = styled.p`
  color: ${color('white-60')};
  font-size: ${fontSize(4)};
  padding-block: ${spacing(8)};
  text-align: center;
`;

function EmbedLoadingFallback() {
  const { i18n } = useLingui();
  return <EmbedFallback>{i18n._(msg`Carregando formulário…`)}</EmbedFallback>;
}

// The Cal.com embed ships only when the modal first opens — it never weighs on
// a page load where the visitor does not ask for it.
const CalFormEmbed = lazy(() =>
  import('@/platform/cal/CalEmbed').then((mod) => ({
    default: mod.CalEmbed,
  })),
);

export function ContactCalModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { i18n } = useLingui();

  return (
    <Modal onClose={onClose} open={open}>
      <Dialog.Title render={<Title />}>{i18n._(msg`Fale conosco`)}</Dialog.Title>
      <EmbedShell>
        <ClientOnly fallback={<EmbedLoadingFallback />}>
          <CalFormEmbed calLink={CONTACT_CAL_FORM_CAL_LINK} />
        </ClientOnly>
      </EmbedShell>
    </Modal>
  );
}
