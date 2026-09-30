import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconBrandWhatsapp } from 'zyra-ui/icon';
import { ThemeContext } from 'zyra-ui/theme-constants';

import { WhatsappInbox } from '@/activities/whatsapp/components/WhatsappInbox';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

export const WhatsappInboxPage = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<IconBrandWhatsapp size={theme.icon.size.md} />}
          title={t`WhatsApp`}
        />
      }
    >
      <WhatsappInbox />
    </PageCardLayout>
  );
};
