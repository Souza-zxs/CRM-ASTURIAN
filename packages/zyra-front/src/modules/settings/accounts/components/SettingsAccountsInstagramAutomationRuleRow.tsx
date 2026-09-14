import { type InstagramAutomationRule } from '@/accounts/types/InstagramAutomationRule';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconPencil, IconTrash } from 'zyra-ui/icon';
import { IconButton, Toggle } from 'zyra-ui/input';
import { Chip, ChipVariant } from 'zyra-ui/data-display';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledCampaignCell = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledCampaignName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPendingLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-style: italic;
`;

const StyledKeywordsCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledActionsCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsAccountsInstagramAutomationRuleRow = ({
  rule,
  onToggleActive,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  rule: InstagramAutomationRule;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (rule: InstagramAutomationRule) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useLingui();

  const isPendingNextReel = rule.attachToNextReel && !rule.igMediaId;
  // Rules created before the campaign "name" field existed have none — fall
  // back to the trigger keywords, then to the attached post/Reel.
  const campaignName =
    rule.name ||
    (rule.keywords.length > 0 ? rule.keywords.join(', ') : null) ||
    rule.igMediaCaption ||
    rule.igMediaPermalink ||
    t`Untitled campaign`;

  return (
    <TableRow gridTemplateColumns="minmax(0, 1fr) minmax(0, 1fr) auto">
      <TableCell>
        <StyledCampaignCell>
          <StyledCampaignName title={campaignName}>{campaignName}</StyledCampaignName>
          {isPendingNextReel && (
            <StyledPendingLabel>{t`Pending next Reel`}</StyledPendingLabel>
          )}
        </StyledCampaignCell>
      </TableCell>
      <TableCell>
        <StyledKeywordsCell>
          {rule.keywords.map((keyword) => (
            <Chip key={keyword} label={keyword} variant={ChipVariant.Highlighted} />
          ))}
        </StyledKeywordsCell>
      </TableCell>
      <TableCell align="right">
        <StyledActionsCell>
          <Toggle
            value={rule.isActive}
            aria-label={t`Enable or disable campaign`}
            onChange={(isActive) => onToggleActive(rule.id, isActive)}
          />
          <IconButton
            Icon={IconPencil}
            variant="secondary"
            size="small"
            ariaLabel={t`Edit campaign`}
            onClick={() => onEdit(rule)}
          />
          <IconButton
            Icon={IconCopy}
            variant="secondary"
            size="small"
            ariaLabel={t`Duplicate campaign`}
            onClick={() => onDuplicate(rule.id)}
          />
          <IconButton
            Icon={IconTrash}
            accent="danger"
            variant="secondary"
            size="small"
            ariaLabel={t`Delete campaign`}
            onClick={() => onDelete(rule.id)}
          />
        </StyledActionsCell>
      </TableCell>
    </TableRow>
  );
};
