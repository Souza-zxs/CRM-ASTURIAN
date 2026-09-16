import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus, IconTrash } from 'zyra-ui/icon';
import { Button, IconButton } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { InputLabel } from '@/ui/input/components/InputLabel';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  > :first-child {
    flex: 1 1 0;
  }
`;

const StyledRemoveButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledAddButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};
`;

// Rotating the public comment reply among a few variations makes automated
// replies look less like a bot repeating the exact same sentence every time.
type SettingsAccountsInstagramCampaignReplyVariationsFieldProps = {
  variations: string[];
  onChange: (variations: string[]) => void;
};

export const SettingsAccountsInstagramCampaignReplyVariationsField = ({
  variations,
  onChange,
}: SettingsAccountsInstagramCampaignReplyVariationsFieldProps) => {
  const { t } = useLingui();

  const handleItemChange = (index: number, value: string) => {
    onChange(variations.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const handleRemoveItem = (index: number) => {
    onChange(variations.filter((_item, itemIndex) => itemIndex !== index));
  };

  const handleAddItem = () => {
    onChange([...variations, '']);
  };

  return (
    <StyledContainer>
      <InputLabel>{t`Public reply variations`}</InputLabel>
      {variations.map((variation, index) => (
        // Items have no stable identifier of their own, only a position.
        // eslint-disable-next-line react/no-array-index-key
        <StyledRow key={index}>
          <TextArea
            textAreaId={`instagram-campaign-public-reply-variation-${index}`}
            value={variation}
            onChange={(value) => handleItemChange(index, value)}
            placeholder={t`Thanks! Check your DMs 📩`}
            minRows={2}
          />
          <StyledRemoveButtonContainer>
            <IconButton
              Icon={IconTrash}
              accent="danger"
              variant="secondary"
              size="small"
              ariaLabel={t`Remove variation`}
              onClick={() => handleRemoveItem(index)}
            />
          </StyledRemoveButtonContainer>
        </StyledRow>
      ))}
      <StyledAddButtonContainer>
        <Button
          Icon={IconPlus}
          title={t`Add variation`}
          variant="secondary"
          size="small"
          onClick={handleAddItem}
        />
      </StyledAddButtonContainer>
    </StyledContainer>
  );
};
