import { useImportInstagramAutomationRulesFromCsv } from '@/settings/accounts/hooks/useImportInstagramAutomationRulesFromCsv';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { IconFileImport } from 'zyra-ui/icon';
import { Button } from 'zyra-ui/input';

type SettingsAccountsInstagramCampaignCsvImportButtonProps = {
  instagramChannelId: string;
  onImported: () => void;
};

export const SettingsAccountsInstagramCampaignCsvImportButton = ({
  instagramChannelId,
  onImported,
}: SettingsAccountsInstagramCampaignCsvImportButtonProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { importRulesFromFile, loading } = useImportInstagramAutomationRulesFromCsv(
    instagramChannelId,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const importedRules = await importRulesFromFile(file);

      enqueueSuccessSnackBar({
        message: t`${importedRules.length} campaigns imported from CSV.`,
      });

      onImported();
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not import campaigns from this CSV file.`,
      });
    }
  };

  return (
    <>
      <span
        title={t`CSV columns: keywords, replyMessage (separate multiple keywords with ; or |)`}
      >
        <Button
          Icon={IconFileImport}
          title={t`Import CSV`}
          variant="secondary"
          size="small"
          disabled={loading}
          onClick={handleButtonClick}
        />
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
};
