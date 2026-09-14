import {
  type InstagramAutomationRule,
  type InstagramMediaSummary,
} from '@/accounts/types/InstagramAutomationRule';
import { type InstagramCampaignTemplate } from '@/accounts/types/InstagramCampaignTemplate';
import { SettingsAccountsInstagramCampaignReplyVariationsField } from '@/settings/accounts/components/SettingsAccountsInstagramCampaignReplyVariationsField';
import { GET_INSTAGRAM_RECENT_MEDIA } from '@/settings/accounts/graphql/queries/getInstagramRecentMedia';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { Button, Toggle } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

export type SettingsAccountsInstagramCampaignFormValues = {
  name: string | null;
  attachToNextReel: boolean;
  igMediaId: string | null;
  igMediaCaption: string | null;
  igMediaThumbnailUrl: string | null;
  igMediaPermalink: string | null;
  keywords: string[];
  replyMessage: string;
  publicReplyVariations: string[] | null;
  requiresFollowToReceiveDm: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number | null;
};

const parseKeywords = (value: string): string[] =>
  value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => isNonEmptyString(keyword));

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledToggleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledToggleLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsAccountsInstagramCampaignFormProps = {
  instagramChannelId: string;
  rule: InstagramAutomationRule | null;
  template?: InstagramCampaignTemplate | null;
  onSubmit: (values: SettingsAccountsInstagramCampaignFormValues) => Promise<void>;
  onCancel: () => void;
};

export const SettingsAccountsInstagramCampaignForm = ({
  instagramChannelId,
  rule,
  template = null,
  onSubmit,
  onCancel,
}: SettingsAccountsInstagramCampaignFormProps) => {
  const { t } = useLingui();
  const apolloClient = useApolloClient();
  const isEditing = rule !== null;

  const { data, loading: mediaLoading } = useQuery<{
    instagramRecentMedia: InstagramMediaSummary[];
  }>(GET_INSTAGRAM_RECENT_MEDIA, {
    client: apolloClient,
    variables: { instagramChannelId },
  });

  const media = data?.instagramRecentMedia ?? [];

  const [name, setName] = useState(rule?.name ?? template?.name ?? '');
  const [attachToNextReel, setAttachToNextReel] = useState(
    rule?.attachToNextReel ?? false,
  );
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    rule?.igMediaId ?? null,
  );
  const [keywordsInput, setKeywordsInput] = useState(
    rule?.keywords.join(', ') ?? template?.suggestedKeywords.join(', ') ?? '',
  );
  const [replyMessage, setReplyMessage] = useState(
    rule?.replyMessage ?? template?.suggestedReplyMessage ?? '',
  );
  const [publicReplyVariations, setPublicReplyVariations] = useState<string[]>(
    rule?.publicReplyVariations ?? template?.suggestedPublicReplyVariations ?? [],
  );
  const [requiresFollowToReceiveDm, setRequiresFollowToReceiveDm] = useState(
    rule?.requiresFollowToReceiveDm ?? false,
  );
  const [followUpMessage, setFollowUpMessage] = useState(
    rule?.followUpMessage ?? template?.suggestedFollowUpMessage ?? '',
  );
  const [followUpDelayMinutesInput, setFollowUpDelayMinutesInput] = useState(
    rule?.followUpDelayMinutes !== null && rule?.followUpDelayMinutes !== undefined
      ? String(rule.followUpDelayMinutes)
      : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaOptions = useMemo(
    () =>
      media.map((item) => ({
        value: item.id,
        label: item.caption?.slice(0, 60) || item.permalink,
      })),
    [media],
  );

  const selectedMedia = media.find((item) => item.id === selectedMediaId);
  const keywords = parseKeywords(keywordsInput);
  const hasFollowUpMessage = isNonEmptyString(followUpMessage.trim());

  const canSubmit =
    keywords.length > 0 &&
    isNonEmptyString(replyMessage.trim()) &&
    (attachToNextReel || isEditing || isNonEmptyString(selectedMediaId ?? ''));

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: isNonEmptyString(name.trim()) ? name.trim() : null,
        attachToNextReel,
        igMediaId: attachToNextReel ? null : (selectedMediaId ?? rule?.igMediaId ?? null),
        igMediaCaption: attachToNextReel
          ? null
          : (selectedMedia?.caption ?? rule?.igMediaCaption ?? null),
        igMediaThumbnailUrl: attachToNextReel
          ? null
          : (selectedMedia?.thumbnailUrl ?? rule?.igMediaThumbnailUrl ?? null),
        igMediaPermalink: attachToNextReel
          ? null
          : (selectedMedia?.permalink ?? rule?.igMediaPermalink ?? null),
        keywords,
        replyMessage: replyMessage.trim(),
        publicReplyVariations: publicReplyVariations
          .map((variation) => variation.trim())
          .filter((variation) => isNonEmptyString(variation)),
        requiresFollowToReceiveDm,
        followUpMessage: hasFollowUpMessage ? followUpMessage.trim() : null,
        followUpDelayMinutes: hasFollowUpMessage
          ? (Number(followUpDelayMinutesInput) || 0)
          : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={isEditing ? t`Edit campaign` : t`New campaign`}
        description={t`When someone comments one of these keywords, they automatically get a direct message.`}
      />
      <StyledFields>
        <SettingsTextInput
          instanceId="instagram-campaign-name"
          label={t`Campaign name`}
          value={name}
          onChange={setName}
          placeholder={t`E.g.: Link in bio promo`}
          fullWidth
        />
        <StyledToggleRow>
          <StyledToggleLabel>
            {t`Attach automatically to the next Reel`}
          </StyledToggleLabel>
          <Toggle
            value={attachToNextReel}
            aria-label={t`Attach automatically to the next Reel`}
            disabled={isEditing}
            onChange={setAttachToNextReel}
          />
        </StyledToggleRow>
        {!attachToNextReel && (
          <Select
            dropdownId="instagram-campaign-media-select"
            label={t`Post`}
            fullWidth
            disabled={mediaLoading || isEditing}
            options={mediaOptions}
            value={selectedMediaId ?? undefined}
            onChange={setSelectedMediaId}
            withSearchInput
          />
        )}
        <SettingsTextInput
          instanceId="instagram-campaign-keywords"
          label={t`Keywords`}
          value={keywordsInput}
          onChange={setKeywordsInput}
          placeholder={t`promo, desconto, quero`}
          fullWidth
        />
        <TextArea
          textAreaId="instagram-campaign-reply-message"
          label={t`Direct message reply`}
          value={replyMessage}
          onChange={setReplyMessage}
          placeholder={t`Thanks for your interest! Here's the link: ...`}
          minRows={3}
        />
        <SettingsAccountsInstagramCampaignReplyVariationsField
          variations={publicReplyVariations}
          onChange={setPublicReplyVariations}
        />
        <StyledToggleRow>
          <StyledToggleLabel>
            {t`Require the person to follow the account before receiving the DM`}
          </StyledToggleLabel>
          <Toggle
            value={requiresFollowToReceiveDm}
            aria-label={t`Require the person to follow the account before receiving the DM`}
            onChange={setRequiresFollowToReceiveDm}
          />
        </StyledToggleRow>
        <TextArea
          textAreaId="instagram-campaign-follow-up-message"
          label={t`Follow-up message (optional)`}
          value={followUpMessage}
          onChange={setFollowUpMessage}
          placeholder={t`Still interested? Here's a special offer just for you.`}
          minRows={2}
        />
        {hasFollowUpMessage && (
          <div>
            <InputLabel>{t`Follow-up delay (minutes)`}</InputLabel>
            <SettingsTextInput
              instanceId="instagram-campaign-follow-up-delay"
              type="number"
              value={followUpDelayMinutesInput}
              onChange={setFollowUpDelayMinutesInput}
              placeholder="60"
              fullWidth
            />
          </div>
        )}
      </StyledFields>
      <StyledActions>
        <Button
          title={t`Cancel`}
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        />
        <Button
          title={isEditing ? t`Save changes` : t`Create campaign`}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledActions>
    </Section>
  );
};
