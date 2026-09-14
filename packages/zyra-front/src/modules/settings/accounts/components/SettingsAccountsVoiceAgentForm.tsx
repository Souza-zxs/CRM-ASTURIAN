import { type VoiceAgent } from '@/accounts/types/VoiceAgent';
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

export type VoiceAgentFormValues = {
  name: string;
  systemPrompt: string;
  phoneNumber: string | null;
  voice: string;
  greetingMessage: string | null;
  forbiddenPhrases: string[] | null;
  qualificationCriteria: string | null;
  handoffInstructions: string | null;
  transferPhoneNumber: string | null;
};

// Illustrative voice list only — check the official, up-to-date list of
// voices supported by the OpenAI Realtime API before shipping to production.
const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'verse', label: 'Verse' },
  { value: 'aria', label: 'Aria' },
  { value: 'sage', label: 'Sage' },
];

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

const StyledFieldsRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};

  > * {
    flex: 1 1 0;
  }
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsAccountsVoiceAgentFormProps = {
  voiceAgent: VoiceAgent | null;
  onSubmit: (values: VoiceAgentFormValues) => Promise<void>;
  onCancel: () => void;
};

export const SettingsAccountsVoiceAgentForm = ({
  voiceAgent,
  onSubmit,
  onCancel,
}: SettingsAccountsVoiceAgentFormProps) => {
  const { t } = useLingui();
  const isEditing = voiceAgent !== null;

  const [name, setName] = useState(voiceAgent?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(
    voiceAgent?.phoneNumber ?? '',
  );
  const [voice, setVoice] = useState(voiceAgent?.voice ?? VOICE_OPTIONS[0].value);
  const [greetingMessage, setGreetingMessage] = useState(
    voiceAgent?.greetingMessage ?? '',
  );
  const [systemPrompt, setSystemPrompt] = useState(
    voiceAgent?.systemPrompt ?? '',
  );
  const [qualificationCriteria, setQualificationCriteria] = useState(
    voiceAgent?.qualificationCriteria ?? '',
  );
  const [forbiddenPhrasesInput, setForbiddenPhrasesInput] = useState(
    voiceAgent?.forbiddenPhrases?.join(', ') ?? '',
  );
  const [handoffInstructions, setHandoffInstructions] = useState(
    voiceAgent?.handoffInstructions ?? '',
  );
  const [transferPhoneNumber, setTransferPhoneNumber] = useState(
    voiceAgent?.transferPhoneNumber ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    isNonEmptyString(name.trim()) && isNonEmptyString(systemPrompt.trim());

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        systemPrompt: systemPrompt.trim(),
        phoneNumber: isNonEmptyString(phoneNumber.trim())
          ? phoneNumber.trim()
          : null,
        voice,
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
        transferPhoneNumber: isNonEmptyString(transferPhoneNumber.trim())
          ? transferPhoneNumber.trim()
          : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={isEditing ? t`Edit voice agent` : t`New voice agent`}
        description={t`Configure how the AI agent should behave during phone calls.`}
      />
      <StyledFields>
        <StyledFieldsRow>
          <SettingsTextInput
            instanceId="voice-agent-name"
            label={t`Name`}
            value={name}
            onChange={setName}
            placeholder={t`E.g.: Sales representative`}
            fullWidth
          />
          <SettingsTextInput
            instanceId="voice-agent-phone-number"
            label={t`Phone number`}
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="+15551234567"
            fullWidth
          />
        </StyledFieldsRow>
        <Select
          dropdownId="voice-agent-voice-select"
          label={t`Voice`}
          fullWidth
          options={VOICE_OPTIONS}
          value={voice}
          onChange={setVoice}
        />
        <SettingsTextInput
          instanceId="voice-agent-greeting-message"
          label={t`Greeting message`}
          value={greetingMessage}
          onChange={setGreetingMessage}
          placeholder={t`Hi! This is the company's virtual assistant, how can I help?`}
          fullWidth
        />
        <TextArea
          textAreaId="voice-agent-system-prompt"
          label={t`System prompt`}
          value={systemPrompt}
          onChange={setSystemPrompt}
          placeholder={t`Describe the persona, goal and tone of voice the agent should use during the call.`}
          minRows={5}
        />
        <TextArea
          textAreaId="voice-agent-qualification-criteria"
          label={t`Qualification criteria`}
          value={qualificationCriteria}
          onChange={setQualificationCriteria}
          placeholder={t`Describe what makes a lead qualified on this call.`}
          minRows={3}
        />
        <SettingsTextInput
          instanceId="voice-agent-forbidden-phrases"
          label={t`Forbidden phrases`}
          value={forbiddenPhrasesInput}
          onChange={setForbiddenPhrasesInput}
          placeholder={t`guaranteed, risk-free, 100% return`}
          fullWidth
        />
        <TextArea
          textAreaId="voice-agent-handoff-instructions"
          label={t`Handoff instructions`}
          value={handoffInstructions}
          onChange={setHandoffInstructions}
          placeholder={t`Explain in which situations the agent should transfer the call to a human.`}
          minRows={3}
        />
        <SettingsTextInput
          instanceId="voice-agent-transfer-phone-number"
          label={t`Transfer phone number`}
          value={transferPhoneNumber}
          onChange={setTransferPhoneNumber}
          placeholder="+15551234567"
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
