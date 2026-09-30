import { styled } from '@linaria/react';
import { Avatar } from 'zyra-ui/data-display';
import { themeCssVariables } from 'zyra-ui/theme-constants';

import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

type WhatsappInboxConversationListItemProps = {
  contactDisplayName: string;
  contactPhoneNumber: string;
  lastMessageBody: string;
  lastMessageReceivedAt: string;
  isActive: boolean;
  onClick: () => void;
};

const StyledItem = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  border-left: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.color.blue : 'transparent'};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledDetails = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTopRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledContactName = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPreview = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WhatsappInboxConversationListItem = ({
  contactDisplayName,
  contactPhoneNumber,
  lastMessageBody,
  lastMessageReceivedAt,
  isActive,
  onClick,
}: WhatsappInboxConversationListItemProps) => {
  const displayName = contactDisplayName || contactPhoneNumber;

  return (
    <StyledItem isActive={isActive} onClick={onClick} type="button">
      <Avatar placeholder={displayName} type="rounded" size="md" />
      <StyledDetails>
        <StyledTopRow>
          <StyledContactName>{displayName}</StyledContactName>
          <StyledTimestamp>
            {beautifyPastDateRelativeToNowShort(lastMessageReceivedAt)}
          </StyledTimestamp>
        </StyledTopRow>
        <StyledPreview>{lastMessageBody}</StyledPreview>
      </StyledDetails>
    </StyledItem>
  );
};
