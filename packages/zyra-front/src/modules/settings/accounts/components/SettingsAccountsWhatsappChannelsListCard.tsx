import { type WhatsappChannel } from '@/accounts/types/WhatsappChannel';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { MessageChannelSyncStatus } from 'zyra-shared/types';
import { Status } from 'zyra-ui/data-display';
import { IconBrandWhatsapp } from 'zyra-ui/icon';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const WhatsappChannelSyncStatusBadge = ({
  whatsappChannel,
}: {
  whatsappChannel: WhatsappChannel;
}) => {
  const { t } = useLingui();

  if (!whatsappChannel.isSyncEnabled) {
    return <Status color="gray" text={t`Disabled`} weight="medium" />;
  }

  switch (whatsappChannel.syncStatus) {
    case MessageChannelSyncStatus.ACTIVE:
      return <Status color="green" text={t`Synced`} weight="medium" />;
    case MessageChannelSyncStatus.ONGOING:
      return (
        <Status
          color="turquoise"
          text={t`Syncing`}
          weight="medium"
          isLoaderVisible
        />
      );
    case MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS:
    case MessageChannelSyncStatus.FAILED_UNKNOWN:
      return <Status color="red" text={t`Sync failed`} weight="medium" />;
    case MessageChannelSyncStatus.NOT_SYNCED:
    default:
      return <Status color="orange" text={t`Not synced`} weight="medium" />;
  }
};

export const SettingsAccountsWhatsappChannelsListCard = ({
  whatsappChannels,
}: {
  whatsappChannels: WhatsappChannel[];
}) => {
  const { t } = useLingui();

  return (
    <Table>
      <TableRow gridTemplateColumns="minmax(0, 1fr) auto">
        <TableCell>{t`Number`}</TableCell>
        <TableCell align="right">{t`Status`}</TableCell>
      </TableRow>
      <StyledTableRows>
        {whatsappChannels.map((whatsappChannel) => (
          <TableRow
            key={whatsappChannel.id}
            gridTemplateColumns="minmax(0, 1fr) auto"
          >
            <TableCell>
              <StyledNameCell>
                <IconBrandWhatsapp size={16} />
                {whatsappChannel.displayPhoneNumber}
              </StyledNameCell>
            </TableCell>
            <TableCell align="right">
              <WhatsappChannelSyncStatusBadge
                whatsappChannel={whatsappChannel}
              />
            </TableCell>
          </TableRow>
        ))}
      </StyledTableRows>
    </Table>
  );
};
