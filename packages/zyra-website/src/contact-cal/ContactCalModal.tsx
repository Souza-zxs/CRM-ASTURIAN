'use client';

import { Dialog } from '@base-ui/react/dialog';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
} from '@/tokens';
import { Modal } from '@/ui';

import { ContactLeadForm } from './ContactLeadForm';

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
      <ContactLeadForm />
    </Modal>
  );
}
