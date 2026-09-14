import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Button, Signoff } from '@/ui';

export function WhyZyraSignoff() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(msg`Pronto pra IA, e seu pra moldar.`)}
      crosshairSide="left"
      heading={i18n._(msg`Construa um CRM que seus\nconcorrentes *não conseguem comprar.*`)}
      scheme="dark"
    >
      <Button
        href="https://app.zyra.com/welcome"
        label={i18n._(msg`Começar agora`)}
      />
    </Signoff>
  );
}
