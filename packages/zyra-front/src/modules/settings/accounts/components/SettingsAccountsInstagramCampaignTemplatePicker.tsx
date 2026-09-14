import { type InstagramCampaignTemplate } from '@/accounts/types/InstagramCampaignTemplate';
import { useInstagramCampaignTemplates } from '@/settings/accounts/hooks/useInstagramCampaignTemplates';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Card, CardContent } from 'zyra-ui/surfaces';
import { Button } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { H2Title } from 'zyra-ui/typography';

const StyledCardContentInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTemplateName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTemplateDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsAccountsInstagramCampaignTemplatePickerProps = {
  onSelectTemplate: (template: InstagramCampaignTemplate) => void;
  onStartFromScratch: () => void;
  onCancel: () => void;
};

export const SettingsAccountsInstagramCampaignTemplatePicker = ({
  onSelectTemplate,
  onStartFromScratch,
  onCancel,
}: SettingsAccountsInstagramCampaignTemplatePickerProps) => {
  const { t } = useLingui();
  const { templates, loading } = useInstagramCampaignTemplates();

  return (
    <Section>
      <H2Title
        title={t`Choose a campaign template`}
        description={t`Start from a ready-made playbook or build your own campaign from scratch.`}
      />
      {loading && (
        <SettingsEmptyPlaceholder>{t`Loading templates...`}</SettingsEmptyPlaceholder>
      )}
      {!loading && templates.length > 0 && (
        <Card>
          {templates.map((template, index) => (
            <CardContent
              key={template.key}
              divider={index < templates.length - 1}
              isClickable
              hasHoverHighlight
              onClick={() => onSelectTemplate(template)}
            >
              <StyledCardContentInner>
                <StyledTemplateName>{template.name}</StyledTemplateName>
                <StyledTemplateDescription>
                  {template.description}
                </StyledTemplateDescription>
              </StyledCardContentInner>
            </CardContent>
          ))}
        </Card>
      )}
      <StyledFooter>
        <Button title={t`Cancel`} variant="secondary" onClick={onCancel} />
        <Button
          title={t`Start from scratch`}
          variant="secondary"
          onClick={onStartFromScratch}
        />
      </StyledFooter>
    </Section>
  );
};
