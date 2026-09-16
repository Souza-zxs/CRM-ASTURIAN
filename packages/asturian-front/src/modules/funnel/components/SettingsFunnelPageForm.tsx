import {
  type FunnelFaqItem,
  type FunnelPage,
  type FunnelPageContent,
  type FunnelPageType,
  type FunnelValueStackItem,
} from '@/funnel/types/FunnelPage';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconPlus, IconTrash } from 'zyra-ui/icon';
import { Button, IconButton, Toggle } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

export type FunnelPageFormValues = {
  type: FunnelPageType;
  slug: string;
  content: FunnelPageContent;
  seoTitle: string | null;
  seoDescription: string | null;
};

const PAGE_TYPE_OPTIONS: { value: FunnelPageType; label: string }[] = [
  { value: 'SIGNUP', label: 'Inscrição' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SALES', label: 'Vendas' },
  { value: 'CONFIRMATION', label: 'Confirmação' },
];

const CONFIRMATION_VARIANT_OPTIONS = [
  { value: 'inscricao', label: 'Inscrição' },
  { value: 'compra', label: 'Compra' },
  { value: 'pagamento_recusado', label: 'Pagamento recusado' },
];

const DEFAULT_CONTENT_BY_TYPE: Record<FunnelPageType, FunnelPageContent> = {
  SIGNUP: {
    type: 'SIGNUP',
    headline: '',
    subheadline: '',
    bullets: [],
    ctaLabel: '',
    formSuccessRedirectSlug: '',
  },
  WORKSHOP: {
    type: 'WORKSHOP',
    videoUrl: '',
    chatEnabled: false,
    ctaLabel: '',
    ctaRedirectSlug: '',
  },
  SALES: {
    type: 'SALES',
    headline: '',
    valueStack: [],
    price: '',
    guaranteeText: '',
    faq: [],
    ctaLabel: '',
    checkoutUrl: '',
  },
  CONFIRMATION: {
    type: 'CONFIRMATION',
    variant: 'inscricao',
    message: '',
    nextStepLabel: '',
    nextStepUrl: '',
  },
};

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledListRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledListRowFields = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type BulletsFieldProps = {
  bullets: string[];
  onChange: (bullets: string[]) => void;
};

const BulletsField = ({ bullets, onChange }: BulletsFieldProps) => {
  const { t } = useLingui();

  return (
    <div>
      <H2Title title={t`Bullets`} />
      <StyledList>
        {bullets.map((bullet, index) => (
          <StyledListRow key={index}>
            <StyledListRowFields>
              <SettingsTextInput
                instanceId={`funnel-signup-bullet-${index}`}
                value={bullet}
                onChange={(value) =>
                  onChange(
                    bullets.map((item, itemIndex) =>
                      itemIndex === index ? value : item,
                    ),
                  )
                }
                fullWidth
              />
            </StyledListRowFields>
            <IconButton
              Icon={IconTrash}
              variant="secondary"
              size="small"
              accent="danger"
              ariaLabel={t`Remove bullet`}
              onClick={() =>
                onChange(bullets.filter((_, itemIndex) => itemIndex !== index))
              }
            />
          </StyledListRow>
        ))}
        <Button
          Icon={IconPlus}
          title={t`Add bullet`}
          variant="secondary"
          size="small"
          onClick={() => onChange([...bullets, ''])}
        />
      </StyledList>
    </div>
  );
};

type ValueStackFieldProps = {
  valueStack: FunnelValueStackItem[];
  onChange: (valueStack: FunnelValueStackItem[]) => void;
};

const ValueStackField = ({ valueStack, onChange }: ValueStackFieldProps) => {
  const { t } = useLingui();

  const updateItem = (index: number, changes: Partial<FunnelValueStackItem>) => {
    onChange(
      valueStack.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    );
  };

  return (
    <div>
      <H2Title title={t`Value stack`} />
      <StyledList>
        {valueStack.map((item, index) => (
          <StyledListRow key={index}>
            <StyledListRowFields>
              <SettingsTextInput
                instanceId={`funnel-sales-value-name-${index}`}
                label={t`Name`}
                value={item.name}
                onChange={(name) => updateItem(index, { name })}
                fullWidth
              />
              <SettingsTextInput
                instanceId={`funnel-sales-value-description-${index}`}
                label={t`Description`}
                value={item.description}
                onChange={(description) => updateItem(index, { description })}
                fullWidth
              />
              <SettingsTextInput
                instanceId={`funnel-sales-value-perceived-${index}`}
                label={t`Perceived value`}
                value={item.perceivedValue}
                onChange={(perceivedValue) =>
                  updateItem(index, { perceivedValue })
                }
                fullWidth
              />
            </StyledListRowFields>
            <IconButton
              Icon={IconTrash}
              variant="secondary"
              size="small"
              accent="danger"
              ariaLabel={t`Remove item`}
              onClick={() =>
                onChange(
                  valueStack.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          </StyledListRow>
        ))}
        <Button
          Icon={IconPlus}
          title={t`Add item`}
          variant="secondary"
          size="small"
          onClick={() =>
            onChange([
              ...valueStack,
              { name: '', description: '', perceivedValue: '' },
            ])
          }
        />
      </StyledList>
    </div>
  );
};

type FaqFieldProps = {
  faq: FunnelFaqItem[];
  onChange: (faq: FunnelFaqItem[]) => void;
};

const FaqField = ({ faq, onChange }: FaqFieldProps) => {
  const { t } = useLingui();

  const updateItem = (index: number, changes: Partial<FunnelFaqItem>) => {
    onChange(
      faq.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    );
  };

  return (
    <div>
      <H2Title title={t`FAQ`} />
      <StyledList>
        {faq.map((item, index) => (
          <StyledListRow key={index}>
            <StyledListRowFields>
              <SettingsTextInput
                instanceId={`funnel-sales-faq-question-${index}`}
                label={t`Question`}
                value={item.question}
                onChange={(question) => updateItem(index, { question })}
                fullWidth
              />
              <TextArea
                textAreaId={`funnel-sales-faq-answer-${index}`}
                label={t`Answer`}
                value={item.answer}
                onChange={(answer) => updateItem(index, { answer })}
                minRows={2}
              />
            </StyledListRowFields>
            <IconButton
              Icon={IconTrash}
              variant="secondary"
              size="small"
              accent="danger"
              ariaLabel={t`Remove question`}
              onClick={() =>
                onChange(faq.filter((_, itemIndex) => itemIndex !== index))
              }
            />
          </StyledListRow>
        ))}
        <Button
          Icon={IconPlus}
          title={t`Add question`}
          variant="secondary"
          size="small"
          onClick={() => onChange([...faq, { question: '', answer: '' }])}
        />
      </StyledList>
    </div>
  );
};

type SettingsFunnelPageFormProps = {
  funnelPage: FunnelPage | null;
  onSubmit: (values: FunnelPageFormValues) => Promise<void>;
  onCancel: () => void;
};

export const SettingsFunnelPageForm = ({
  funnelPage,
  onSubmit,
  onCancel,
}: SettingsFunnelPageFormProps) => {
  const { t } = useLingui();
  const isEditing = funnelPage !== null;

  const [type, setType] = useState<FunnelPageType>(
    funnelPage?.type ?? 'SIGNUP',
  );
  const [slug, setSlug] = useState(funnelPage?.slug ?? '');
  const [content, setContent] = useState<FunnelPageContent>(
    funnelPage?.content ?? DEFAULT_CONTENT_BY_TYPE.SIGNUP,
  );
  const [seoTitle, setSeoTitle] = useState(funnelPage?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(
    funnelPage?.seoDescription ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (nextType: FunnelPageType) => {
    setType(nextType);
    setContent(DEFAULT_CONTENT_BY_TYPE[nextType]);
  };

  const canSubmit = isNonEmptyString(slug.trim());

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        type,
        slug: slug.trim(),
        content,
        seoTitle: isNonEmptyString(seoTitle.trim()) ? seoTitle.trim() : null,
        seoDescription: isNonEmptyString(seoDescription.trim())
          ? seoDescription.trim()
          : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={isEditing ? t`Edit funnel page` : t`New funnel page`}
        description={t`Configure the content of a funnel page — it becomes live at /{slug} once published.`}
      />
      <StyledFields>
        <Select
          dropdownId="funnel-page-type-select"
          label={t`Page type`}
          fullWidth
          disabled={isEditing}
          options={PAGE_TYPE_OPTIONS}
          value={type}
          onChange={(value) => handleTypeChange(value as FunnelPageType)}
        />
        <SettingsTextInput
          instanceId="funnel-page-slug"
          label={t`Slug`}
          value={slug}
          onChange={setSlug}
          placeholder={t`inscricao`}
          fullWidth
        />
        <SettingsTextInput
          instanceId="funnel-page-seo-title"
          label={t`SEO title (optional)`}
          value={seoTitle}
          onChange={setSeoTitle}
          fullWidth
        />
        <SettingsTextInput
          instanceId="funnel-page-seo-description"
          label={t`SEO description (optional)`}
          value={seoDescription}
          onChange={setSeoDescription}
          fullWidth
        />

        {content.type === 'SIGNUP' && (
          <>
            <SettingsTextInput
              instanceId="funnel-signup-headline"
              label={t`Headline`}
              value={content.headline}
              onChange={(headline) => setContent({ ...content, headline })}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-signup-subheadline"
              label={t`Subheadline`}
              value={content.subheadline}
              onChange={(subheadline) =>
                setContent({ ...content, subheadline })
              }
              fullWidth
            />
            <BulletsField
              bullets={content.bullets}
              onChange={(bullets) => setContent({ ...content, bullets })}
            />
            <SettingsTextInput
              instanceId="funnel-signup-cta-label"
              label={t`CTA label`}
              value={content.ctaLabel}
              onChange={(ctaLabel) => setContent({ ...content, ctaLabel })}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-signup-success-redirect"
              label={t`Redirect slug on success`}
              value={content.formSuccessRedirectSlug}
              onChange={(formSuccessRedirectSlug) =>
                setContent({ ...content, formSuccessRedirectSlug })
              }
              fullWidth
            />
          </>
        )}

        {content.type === 'WORKSHOP' && (
          <>
            <SettingsTextInput
              instanceId="funnel-workshop-video-url"
              label={t`Video URL`}
              value={content.videoUrl}
              onChange={(videoUrl) => setContent({ ...content, videoUrl })}
              fullWidth
            />
            <Toggle
              value={content.chatEnabled}
              aria-label={t`Enable simulated chat`}
              onChange={(chatEnabled) =>
                setContent({ ...content, chatEnabled })
              }
            />
            <SettingsTextInput
              instanceId="funnel-workshop-cta-label"
              label={t`CTA label`}
              value={content.ctaLabel}
              onChange={(ctaLabel) => setContent({ ...content, ctaLabel })}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-workshop-cta-redirect"
              label={t`Redirect slug (offer page)`}
              value={content.ctaRedirectSlug}
              onChange={(ctaRedirectSlug) =>
                setContent({ ...content, ctaRedirectSlug })
              }
              fullWidth
            />
          </>
        )}

        {content.type === 'SALES' && (
          <>
            <SettingsTextInput
              instanceId="funnel-sales-headline"
              label={t`Headline`}
              value={content.headline}
              onChange={(headline) => setContent({ ...content, headline })}
              fullWidth
            />
            <ValueStackField
              valueStack={content.valueStack}
              onChange={(valueStack) =>
                setContent({ ...content, valueStack })
              }
            />
            <SettingsTextInput
              instanceId="funnel-sales-price"
              label={t`Price`}
              value={content.price}
              onChange={(price) => setContent({ ...content, price })}
              fullWidth
            />
            <TextArea
              textAreaId="funnel-sales-guarantee"
              label={t`Guarantee`}
              value={content.guaranteeText}
              onChange={(guaranteeText) =>
                setContent({ ...content, guaranteeText })
              }
              minRows={2}
            />
            <FaqField
              faq={content.faq}
              onChange={(faq) => setContent({ ...content, faq })}
            />
            <SettingsTextInput
              instanceId="funnel-sales-cta-label"
              label={t`CTA label`}
              value={content.ctaLabel}
              onChange={(ctaLabel) => setContent({ ...content, ctaLabel })}
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-sales-checkout-url"
              label={t`Checkout URL`}
              value={content.checkoutUrl}
              onChange={(checkoutUrl) =>
                setContent({ ...content, checkoutUrl })
              }
              fullWidth
            />
          </>
        )}

        {content.type === 'CONFIRMATION' && (
          <>
            <Select
              dropdownId="funnel-confirmation-variant-select"
              label={t`Variant`}
              fullWidth
              options={CONFIRMATION_VARIANT_OPTIONS}
              value={content.variant}
              onChange={(variant) =>
                setContent({
                  ...content,
                  variant: variant as
                    | 'inscricao'
                    | 'compra'
                    | 'pagamento_recusado',
                })
              }
            />
            <TextArea
              textAreaId="funnel-confirmation-message"
              label={t`Message`}
              value={content.message}
              onChange={(message) => setContent({ ...content, message })}
              minRows={2}
            />
            <SettingsTextInput
              instanceId="funnel-confirmation-next-step-label"
              label={t`Next step label`}
              value={content.nextStepLabel}
              onChange={(nextStepLabel) =>
                setContent({ ...content, nextStepLabel })
              }
              fullWidth
            />
            <SettingsTextInput
              instanceId="funnel-confirmation-next-step-url"
              label={t`Next step URL or slug`}
              value={content.nextStepUrl}
              onChange={(nextStepUrl) =>
                setContent({ ...content, nextStepUrl })
              }
              fullWidth
            />
          </>
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
          title={isEditing ? t`Save changes` : t`Create page`}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledActions>
    </Section>
  );
};
