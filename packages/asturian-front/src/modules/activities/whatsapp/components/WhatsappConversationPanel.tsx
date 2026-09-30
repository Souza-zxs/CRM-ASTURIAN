import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isSameDay } from 'date-fns';
import { Fragment, useEffect, useRef, useState } from 'react';
import { IconSend } from 'zyra-ui/icon';
import { RoundedIconButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { WhatsappMessageBubble } from '@/activities/whatsapp/components/WhatsappMessageBubble';
import { useSendWhatsappMessage } from '@/activities/whatsapp/hooks/useSendWhatsappMessage';
import { type WhatsappThreadMessage } from '@/activities/whatsapp/types/WhatsappThreadMessage';
import {
  getWhatsappContactPhoneNumber,
  isWhatsappMessageOutgoing,
  normalizeWhatsappPhoneNumber,
} from '@/activities/whatsapp/utils/whatsappPhoneNumber';
import { useMyWhatsappChannels } from '@/settings/accounts/hooks/useMyWhatsappChannels';
import { beautifyExactDate } from '~/utils/date-utils';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledMessageList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledDaySeparator = styled.div`
  align-self: center;
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledReplyRow = styled.form`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledReplyInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};

  &:focus {
    border-color: ${themeCssVariables.border.color.blue};
    outline: none;
  }
`;

type WhatsappConversationPanelProps = {
  messages: WhatsappThreadMessage[];
  // Telefone conhecido do contato (ex.: vindo da lista de conversas); se
  // ausente, deriva dos participantes das mensagens
  contactPhoneNumber?: string | null;
};

export const WhatsappConversationPanel = ({
  messages,
  contactPhoneNumber: knownContactPhoneNumber,
}: WhatsappConversationPanelProps) => {
  const { t } = useLingui();
  const { channels } = useMyWhatsappChannels();
  const { sendWhatsappMessage, loading: sending } = useSendWhatsappMessage();
  const [draft, setDraft] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  const ownPhoneNumbers = channels.map(
    (channel) => channel.displayPhoneNumber,
  );
  const connectedAccountId = channels[0]?.connectedAccountId;
  const contactPhoneNumber =
    normalizeWhatsappPhoneNumber(knownContactPhoneNumber).length > 0
      ? normalizeWhatsappPhoneNumber(knownContactPhoneNumber)
      : getWhatsappContactPhoneNumber(messages, ownPhoneNumbers);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const body = draft.trim();

    if (body.length === 0 || !connectedAccountId || !contactPhoneNumber) {
      return;
    }

    const wasSent = await sendWhatsappMessage({
      connectedAccountId,
      to: contactPhoneNumber,
      body,
    });

    if (wasSent) {
      setDraft('');
    }
  };

  return (
    <StyledContainer>
      <StyledMessageList ref={messageListRef}>
        {messages.map((message, index) => {
          const timestamp = message.receivedAt ?? message.createdAt;
          const previousMessage = messages[index - 1];
          const previousTimestamp = previousMessage
            ? (previousMessage.receivedAt ?? previousMessage.createdAt)
            : null;
          const isNewDay =
            !previousTimestamp ||
            !isSameDay(new Date(timestamp), new Date(previousTimestamp));

          return (
            <Fragment key={message.id}>
              {isNewDay && (
                <StyledDaySeparator>
                  {beautifyExactDate(timestamp)}
                </StyledDaySeparator>
              )}
              <WhatsappMessageBubble
                message={message}
                isOutgoing={isWhatsappMessageOutgoing(
                  message,
                  ownPhoneNumbers,
                )}
              />
            </Fragment>
          );
        })}
      </StyledMessageList>
      <StyledReplyRow onSubmit={handleSubmit}>
        <StyledReplyInput
          aria-label={t`Type a reply...`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t`Type a reply...`}
        />
        <RoundedIconButton
          Icon={IconSend}
          type="submit"
          size="medium"
          aria-label={t`Send`}
          disabled={
            sending ||
            draft.trim().length === 0 ||
            !connectedAccountId ||
            !contactPhoneNumber
          }
        />
      </StyledReplyRow>
    </StyledContainer>
  );
};
