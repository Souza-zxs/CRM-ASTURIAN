import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { WhatsappConversationPanel } from '@/activities/whatsapp/components/WhatsappConversationPanel';
import { useWhatsappThreadForPerson } from '@/activities/whatsapp/hooks/useWhatsappThreadForPerson';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[6]};
`;

export const WhatsappCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { messages, loading } = useWhatsappThreadForPerson(targetRecord.id);

  if (loading) {
    return (
      <SettingsEmptyPlaceholder>
        {t`Loading conversation...`}
      </SettingsEmptyPlaceholder>
    );
  }

  if (messages.length === 0) {
    return (
      <SettingsEmptyPlaceholder>
        {t`No WhatsApp conversation yet`}
      </SettingsEmptyPlaceholder>
    );
  }

  return (
    <StyledContainer>
      <WhatsappConversationPanel messages={messages} />
    </StyledContainer>
  );
};
