import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Button, Signoff } from '@/ui';

export function CustomersCatalogSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`Junte-se aos times que decidiram ser donos do próprio CRM. Comece a construir com o Zyra hoje.`,
      )}
      heading={i18n._(msg`Pronto pra construir\n*a sua própria história?*`)}
      scheme="light"
    >
      <Button
        href="https://app.zyra.com/welcome"
        label={i18n._(msg`Começar agora`)}
      />
      <TalkToUsButton label={msg`Falar com a gente`} variant="outlined" />
    </Signoff>
  );
}
