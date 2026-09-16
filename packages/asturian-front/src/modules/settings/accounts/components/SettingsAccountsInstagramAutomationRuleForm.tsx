import { type InstagramMediaSummary } from '@/accounts/types/InstagramAutomationRule';
import { GET_INSTAGRAM_RECENT_MEDIA } from '@/settings/accounts/graphql/queries/getInstagramRecentMedia';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const parseKeywords = (value: string): string[] =>
  value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => isNonEmptyString(keyword));

export const SettingsAccountsInstagramAutomationRuleForm = ({
  instagramChannelId,
  onCreate,
}: {
  instagramChannelId: string;
  onCreate: (input: {
    instagramChannelId: string;
    igMediaId: string;
    igMediaCaption: string | null;
    igMediaThumbnailUrl: string | null;
    igMediaPermalink: string | null;
    keywords: string[];
    replyMessage: string;
  }) => Promise<void>;
}) => {
  const { t } = useLingui();
  const apolloClient = useApolloClient();

  const { data, loading: mediaLoading } = useQuery<{
    instagramRecentMedia: InstagramMediaSummary[];
  }>(GET_INSTAGRAM_RECENT_MEDIA, {
    client: apolloClient,
    variables: { instagramChannelId },
  });

  const media = data?.instagramRecentMedia ?? [];

  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
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

  const canSubmit =
    isNonEmptyString(selectedMediaId ?? '') &&
    keywords.length > 0 &&
    isNonEmptyString(replyMessage.trim());

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMediaId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        instagramChannelId,
        igMediaId: selectedMediaId,
        igMediaCaption: selectedMedia?.caption ?? null,
        igMediaThumbnailUrl: selectedMedia?.thumbnailUrl ?? null,
        igMediaPermalink: selectedMedia?.permalink ?? null,
        keywords,
        replyMessage: replyMessage.trim(),
      });

      setSelectedMediaId(null);
      setKeywordsInput('');
      setReplyMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={t`New automation`}
        description={t`When someone comments one of these keywords on the selected post, they automatically get a direct message.`}
      />
      <StyledFields>
        <Select
          dropdownId="instagram-automation-rule-media-select"
          label={t`Post`}
          fullWidth
          disabled={mediaLoading}
          options={mediaOptions}
          value={selectedMediaId ?? undefined}
          onChange={setSelectedMediaId}
          withSearchInput
        />
        <SettingsTextInput
          instanceId="instagram-automation-rule-keywords"
          value={keywordsInput}
          onChange={setKeywordsInput}
          placeholder={t`promo, desconto, quero`}
          fullWidth
        />
        <TextArea
          textAreaId="instagram-automation-rule-reply-message"
          label={t`Direct message reply`}
          value={replyMessage}
          onChange={setReplyMessage}
          placeholder={t`Thanks for your interest! Here's the link: ...`}
          minRows={3}
        />
      </StyledFields>
      <StyledActions>
        <Button
          title={t`Create automation`}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledActions>
    </Section>
  );
};
