import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'zyra-shared/utils';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { WhatsappConversationPanel } from '@/activities/whatsapp/components/WhatsappConversationPanel';
import { WhatsappInboxConversationListItem } from '@/activities/whatsapp/components/WhatsappInboxConversationListItem';
import { useWhatsappConversations } from '@/activities/whatsapp/hooks/useWhatsappConversations';
import { useWhatsappThreadMessages } from '@/activities/whatsapp/hooks/useWhatsappThreadMessages';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';

const StyledLayout = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 320px 1fr;
  min-height: 0;
`;

const StyledConversationList = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  overflow-y: auto;
`;

const StyledConversationPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[6]};
`;

export const WhatsappInbox = () => {
  const { t } = useLingui();
  const { conversations, loading } = useWhatsappConversations();
  const [selectedMessageThreadId, setSelectedMessageThreadId] = useState<
    string | null
  >(null);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.messageThreadId === selectedMessageThreadId,
  );

  // Busca direto pelo thread da conversa, entao contatos sem Person tambem funcionam
  const { messages } = useWhatsappThreadMessages(
    selectedConversation?.messageThreadId ?? null,
  );

  if (loading) {
    return (
      <SettingsEmptyPlaceholder>
        {t`Loading conversations...`}
      </SettingsEmptyPlaceholder>
    );
  }

  if (conversations.length === 0) {
    return (
      <SettingsEmptyPlaceholder>
        {t`No WhatsApp conversations yet`}
      </SettingsEmptyPlaceholder>
    );
  }

  return (
    <StyledLayout>
      <StyledConversationList>
        {conversations.map((conversation) => (
          <WhatsappInboxConversationListItem
            key={conversation.messageThreadId}
            contactDisplayName={conversation.contactDisplayName}
            contactPhoneNumber={conversation.contactPhoneNumber}
            lastMessageBody={conversation.lastMessageBody}
            lastMessageReceivedAt={conversation.lastMessageReceivedAt}
            isActive={
              conversation.messageThreadId === selectedMessageThreadId
            }
            onClick={() =>
              setSelectedMessageThreadId(conversation.messageThreadId)
            }
          />
        ))}
      </StyledConversationList>
      <StyledConversationPanel>
        {isDefined(selectedConversation) ? (
          <WhatsappConversationPanel
            key={selectedConversation.messageThreadId}
            messages={messages}
            contactPhoneNumber={selectedConversation.contactPhoneNumber}
          />
        ) : (
          <SettingsEmptyPlaceholder>
            {t`Select a conversation`}
          </SettingsEmptyPlaceholder>
        )}
      </StyledConversationPanel>
    </StyledLayout>
  );
};
