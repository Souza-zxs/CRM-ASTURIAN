import { styled } from '@linaria/react';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';
import { beautifyExactDateTime } from '~/utils/date-utils';

// Tail corner (bottom-outer for outgoing, bottom-inner for incoming) stays
// tight while the other three corners are fully rounded, echoing a chat tail
// without an extra decorative element.
const StyledBubble = styled.div<{ isOutgoing: boolean }>`
  align-self: ${({ isOutgoing }) => (isOutgoing ? 'flex-end' : 'flex-start')};
  background: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.color.blue
      : themeCssVariables.background.tertiary};
  border-radius: ${({ isOutgoing }) =>
    isOutgoing
      ? `${themeCssVariables.border.radius.xl} ${themeCssVariables.border.radius.xl} ${themeCssVariables.border.radius.xs} ${themeCssVariables.border.radius.xl}`
      : `${themeCssVariables.border.radius.xl} ${themeCssVariables.border.radius.xl} ${themeCssVariables.border.radius.xl} ${themeCssVariables.border.radius.xs}`};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.primary};
  max-width: 70%;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledTimestamp = styled.span<{ isOutgoing: boolean }>`
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
  opacity: ${({ isOutgoing }) => (isOutgoing ? 0.8 : 0.7)};
  text-align: right;
`;

type WhatsappMessageBubbleProps = {
  message: Pick<WhatsappThreadMessage, 'text' | 'receivedAt' | 'createdAt'>;
  isOutgoing: boolean;
};

export const WhatsappMessageBubble = ({
  message,
  isOutgoing,
}: WhatsappMessageBubbleProps) => {
  const timestamp = message.receivedAt ?? message.createdAt;

  return (
    <StyledBubble isOutgoing={isOutgoing}>
      {message.text}
      <StyledTimestamp isOutgoing={isOutgoing}>
        {beautifyExactDateTime(timestamp)}
      </StyledTimestamp>
    </StyledBubble>
  );
};
