import { type WhatsappAgent } from '@/accounts/types/WhatsappAgent';
import { type WhatsappChannel } from '@/accounts/types/WhatsappChannel';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

export type WhatsappAgentFormValues = {
  name: string;
  whatsappChannelId: string;
  systemPrompt: string;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  model: string | null;
};

const parseForbiddenPhrases = (value: string): string[] =>
  value
    .split(',')
    .map((phrase) => phrase.trim())
    .filter((phrase) => isNonEmptyString(phrase));

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsAccountsWhatsappAgentFormProps = {
  whatsappAgent: WhatsappAgent | null;
  whatsappChannels: WhatsappChannel[];
  onSubmit: (values: WhatsappAgentFormValues) => Promise<void>;
  onCancel: () => void;
};

export const SettingsAccountsWhatsappAgentForm = ({
  whatsappAgent,
  whatsappChannels,
  onSubmit,
  onCancel,
}: SettingsAccountsWhatsappAgentFormProps) => {
  const { t } = useLingui();
  const isEditing = whatsappAgent !== null;

  const whatsappChannelOptions = whatsappChannels.map((whatsappChannel) => ({
    value: whatsappChannel.id,
    label: whatsappChannel.displayPhoneNumber,
  }));

  const [name, setName] = useState(whatsappAgent?.name ?? '');
  const [whatsappChannelId, setWhatsappChannelId] = useState(
    whatsappAgent?.whatsappChannelId ?? whatsappChannelOptions[0]?.value ?? '',
  );
  const [greetingMessage, setGreetingMessage] = useState(
    whatsappAgent?.greetingMessage ?? '',
  );
  const [systemPrompt, setSystemPrompt] = useState(
    whatsappAgent?.systemPrompt ?? '',
  );
  const [qualificationCriteria, setQualificationCriteria] = useState(
    whatsappAgent?.qualificationCriteria ?? '',
  );
  const [forbiddenPhrasesInput, setForbiddenPhrasesInput] = useState(
    whatsappAgent?.forbiddenPhrases?.join(', ') ?? '',
  );
  const [handoffInstructions, setHandoffInstructions] = useState(
    whatsappAgent?.handoffInstructions ?? '',
  );
  const [model, setModel] = useState(whatsappAgent?.model ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    isNonEmptyString(name.trim()) &&
    isNonEmptyString(systemPrompt.trim()) &&
    (isEditing || isNonEmptyString(whatsappChannelId));

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        whatsappChannelId,
        systemPrompt: systemPrompt.trim(),
        greetingMessage: isNonEmptyString(greetingMessage.trim())
          ? greetingMessage.trim()
          : null,
        forbiddenPhrases: parseForbiddenPhrases(forbiddenPhrasesInput),
        qualificationCriteria: isNonEmptyString(qualificationCriteria.trim())
          ? qualificationCriteria.trim()
          : null,
        handoffInstructions: isNonEmptyString(handoffInstructions.trim())
          ? handoffInstructions.trim()
          : null,
        model: isNonEmptyString(model.trim()) ? model.trim() : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={isEditing ? t`Edit WhatsApp agent` : t`New WhatsApp agent`}
        description={t`Configure how the AI agent should behave when replying to WhatsApp messages.`}
      />
      <StyledFields>
        <SettingsTextInput
          instanceId="whatsapp-agent-name"
          label={t`Name`}
          value={name}
          onChange={setName}
          placeholder={t`E.g.: Support assistant`}
          fullWidth
        />
        {isEditing ? (
          <SettingsTextInput
            instanceId="whatsapp-agent-channel"
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
            dropdownId="whatsapp-agent-channel-select"
            label={t`WhatsApp number`}
            fullWidth
            options={whatsappChannelOptions}
            value={whatsappChannelId}
            onChange={setWhatsappChannelId}
            emptyOption={{ label: t`Select a WhatsApp number`, value: '' }}
          />
        )}
        <SettingsTextInput
          instanceId="whatsapp-agent-greeting-message"
          label={t`Greeting message`}
          value={greetingMessage}
          onChange={setGreetingMessage}
          placeholder={t`Hi! This is the company's virtual assistant, how can I help?`}
          fullWidth
        />
        <TextArea
          textAreaId="whatsapp-agent-system-prompt"
          label={t`System prompt`}
          value={systemPrompt}
          onChange={setSystemPrompt}
          placeholder={t`Describe the persona, goal and tone of voice the agent should use when replying to messages.`}
          minRows={5}
        />
        <TextArea
          textAreaId="whatsapp-agent-qualification-criteria"
          label={t`Qualification criteria`}
          value={qualificationCriteria}
          onChange={setQualificationCriteria}
          placeholder={t`Describe what makes a lead qualified on this conversation.`}
          minRows={3}
        />
        <SettingsTextInput
          instanceId="whatsapp-agent-forbidden-phrases"
          label={t`Forbidden phrases`}
          value={forbiddenPhrasesInput}
          onChange={setForbiddenPhrasesInput}
          placeholder={t`guaranteed, risk-free, 100% return`}
          fullWidth
        />
        <TextArea
          textAreaId="whatsapp-agent-handoff-instructions"
          label={t`Handoff instructions`}
          value={handoffInstructions}
          onChange={setHandoffInstructions}
          placeholder={t`Explain in which situations the agent should hand off the conversation to a human.`}
          minRows={3}
        />
        <SettingsTextInput
          instanceId="whatsapp-agent-model"
          label={t`Model`}
          value={model}
          onChange={setModel}
          placeholder="gpt-4.1-mini"
          fullWidth
        />
      </StyledFields>
      <StyledActions>
        <Button
          title={t`Cancel`}
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        />
        <Button
          title={isEditing ? t`Save changes` : t`Create agent`}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledActions>
    </Section>
  );
};
