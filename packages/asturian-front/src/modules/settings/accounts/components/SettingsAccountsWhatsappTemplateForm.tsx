import {
  type WhatsappTemplate,
  type WhatsappTemplateButton,
} from '@/accounts/types/WhatsappTemplate';
import { type WhatsappChannel } from '@/accounts/types/WhatsappChannel';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconPlus, IconTrash } from 'zyra-ui/icon';
import { Button, IconButton } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

export type WhatsappTemplateFormValues = {
  whatsappChannelId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerText: string | null;
  bodyText: string;
  footerText: string | null;
  buttons: WhatsappTemplateButton[] | null;
};

const CATEGORY_OPTIONS = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
];

const BUTTON_TYPE_OPTIONS = [
  { value: 'QUICK_REPLY', label: 'Quick reply' },
  { value: 'URL', label: 'URL' },
  { value: 'PHONE_NUMBER', label: 'Phone number' },
];

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledButtonsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonRowFields = styled.div`
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const isTemplateEditable = (whatsappTemplate: WhatsappTemplate | null) =>
  whatsappTemplate === null ||
  whatsappTemplate.status === 'DRAFT' ||
  whatsappTemplate.status === 'REJECTED';

type SettingsAccountsWhatsappTemplateFormProps = {
  whatsappTemplate: WhatsappTemplate | null;
  whatsappChannels: WhatsappChannel[];
  onSubmit: (values: WhatsappTemplateFormValues) => Promise<void>;
  onCancel: () => void;
};

export const SettingsAccountsWhatsappTemplateForm = ({
  whatsappTemplate,
  whatsappChannels,
  onSubmit,
  onCancel,
}: SettingsAccountsWhatsappTemplateFormProps) => {
  const { t } = useLingui();
  const isEditing = whatsappTemplate !== null;
  const isEditable = isTemplateEditable(whatsappTemplate);

  const whatsappChannelOptions = whatsappChannels.map((whatsappChannel) => ({
    value: whatsappChannel.id,
    label: whatsappChannel.displayPhoneNumber,
  }));

  const [whatsappChannelId, setWhatsappChannelId] = useState(
    whatsappTemplate?.whatsappChannelId ?? whatsappChannelOptions[0]?.value ?? '',
  );
  const [name, setName] = useState(whatsappTemplate?.name ?? '');
  const [category, setCategory] = useState<
    'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  >(whatsappTemplate?.category ?? 'UTILITY');
  const [language, setLanguage] = useState(
    whatsappTemplate?.language ?? 'pt_BR',
  );
  const [headerText, setHeaderText] = useState(
    whatsappTemplate?.headerText ?? '',
  );
  const [bodyText, setBodyText] = useState(whatsappTemplate?.bodyText ?? '');
  const [footerText, setFooterText] = useState(
    whatsappTemplate?.footerText ?? '',
  );
  const [buttons, setButtons] = useState<WhatsappTemplateButton[]>(
    whatsappTemplate?.buttons ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    isEditable &&
    isNonEmptyString(name.trim()) &&
    isNonEmptyString(language.trim()) &&
    isNonEmptyString(bodyText.trim()) &&
    (isEditing || isNonEmptyString(whatsappChannelId));

  const handleAddButton = () => {
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, buttonIndex) => buttonIndex !== index));
  };

  const handleButtonChange = (
    index: number,
    changes: Partial<WhatsappTemplateButton>,
  ) => {
    setButtons(
      buttons.map((button, buttonIndex) =>
        buttonIndex === index ? { ...button, ...changes } : button,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        whatsappChannelId,
        name: name.trim(),
        category,
        language: language.trim(),
        headerText: isNonEmptyString(headerText.trim())
          ? headerText.trim()
          : null,
        bodyText: bodyText.trim(),
        footerText: isNonEmptyString(footerText.trim())
          ? footerText.trim()
          : null,
        buttons: buttons.length > 0 ? buttons : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={isEditing ? t`Edit WhatsApp template` : t`New WhatsApp template`}
        description={t`Templates must be submitted to Meta for approval before they can be used to message contacts outside the 24h window.`}
      />
      {!isEditable && (
        <StyledHint>{t`This template was already submitted to Meta and can no longer be edited — create a new template instead.`}</StyledHint>
      )}
      <StyledFields>
        {isEditing ? (
          <SettingsTextInput
            instanceId="whatsapp-template-channel"
            label={t`WhatsApp number`}
            value={
              whatsappChannels.find(
                (whatsappChannel) => whatsappChannel.id === whatsappChannelId,
              )?.displayPhoneNumber ?? whatsappChannelId
            }
            onChange={() => {}}
            disabled
            fullWidth
          />
        ) : (
          <Select
            dropdownId="whatsapp-template-channel-select"
            label={t`WhatsApp number`}
            fullWidth
            options={whatsappChannelOptions}
            value={whatsappChannelId}
            onChange={setWhatsappChannelId}
            emptyOption={{ label: t`Select a WhatsApp number`, value: '' }}
          />
        )}
        <SettingsTextInput
          instanceId="whatsapp-template-name"
          label={t`Name`}
          value={name}
          onChange={setName}
          placeholder={t`lembrete_sessao`}
          disabled={!isEditable}
          fullWidth
        />
        <StyledHint>{t`Lowercase letters, digits and underscores only — this is Meta's internal template identifier.`}</StyledHint>
        <Select
          dropdownId="whatsapp-template-category-select"
          label={t`Category`}
          fullWidth
          disabled={!isEditable}
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) =>
            setCategory(value as 'MARKETING' | 'UTILITY' | 'AUTHENTICATION')
          }
        />
        <SettingsTextInput
          instanceId="whatsapp-template-language"
          label={t`Language`}
          value={language}
          onChange={setLanguage}
          placeholder="pt_BR"
          disabled={!isEditable}
          fullWidth
        />
        <SettingsTextInput
          instanceId="whatsapp-template-header"
          label={t`Header (optional)`}
          value={headerText}
          onChange={setHeaderText}
          disabled={!isEditable}
          fullWidth
        />
        <TextArea
          textAreaId="whatsapp-template-body"
          label={t`Body`}
          value={bodyText}
          onChange={setBodyText}
          placeholder={t`Use {{1}}, {{2}}... for variables, e.g.: Oi {{1}}, sua sessão libera em {{2}} minutos.`}
          disabled={!isEditable}
          minRows={4}
        />
        <SettingsTextInput
          instanceId="whatsapp-template-footer"
          label={t`Footer (optional)`}
          value={footerText}
          onChange={setFooterText}
          disabled={!isEditable}
          fullWidth
        />
        <div>
          <H2Title title={t`Buttons (optional)`} />
          <StyledButtonsList>
            {buttons.map((button, index) => (
              <StyledButtonRow key={index}>
                <StyledButtonRowFields>
                  <Select
                    dropdownId={`whatsapp-template-button-type-${index}`}
                    options={BUTTON_TYPE_OPTIONS}
                    value={button.type}
                    disabled={!isEditable}
                    onChange={(value) =>
                      handleButtonChange(index, {
                        type: value as WhatsappTemplateButton['type'],
                      })
                    }
                  />
                  <SettingsTextInput
                    instanceId={`whatsapp-template-button-text-${index}`}
                    value={button.text}
                    onChange={(text) => handleButtonChange(index, { text })}
                    placeholder={t`Button label`}
                    disabled={!isEditable}
                    fullWidth
                  />
                  {button.type === 'URL' && (
                    <SettingsTextInput
                      instanceId={`whatsapp-template-button-url-${index}`}
                      value={button.url ?? ''}
                      onChange={(url) => handleButtonChange(index, { url })}
                      placeholder="https://..."
                      disabled={!isEditable}
                      fullWidth
                    />
                  )}
                  {button.type === 'PHONE_NUMBER' && (
                    <SettingsTextInput
                      instanceId={`whatsapp-template-button-phone-${index}`}
                      value={button.phoneNumber ?? ''}
                      onChange={(phoneNumber) =>
                        handleButtonChange(index, { phoneNumber })
                      }
                      placeholder="+55..."
                      disabled={!isEditable}
                      fullWidth
                    />
                  )}
                </StyledButtonRowFields>
                <IconButton
                  Icon={IconTrash}
                  variant="secondary"
                  size="small"
                  accent="danger"
                  ariaLabel={t`Remove button`}
                  disabled={!isEditable}
                  onClick={() => handleRemoveButton(index)}
                />
              </StyledButtonRow>
            ))}
            <Button
              Icon={IconPlus}
              title={t`Add button`}
              variant="secondary"
              size="small"
              disabled={!isEditable}
              onClick={handleAddButton}
            />
          </StyledButtonsList>
        </div>
      </StyledFields>
      <StyledActions>
        <Button
          title={t`Cancel`}
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        />
        <Button
          title={isEditing ? t`Save changes` : t`Create template`}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledActions>
    </Section>
  );
};
