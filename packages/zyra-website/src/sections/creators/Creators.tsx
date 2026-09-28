import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Signoff } from '@/ui';

export function Creators() {
  const i18n = getServerI18n();

  return (
    <Signoff
      body={i18n._(
        msg`A implementação é feita diretamente com a nossa equipe. Deixe seus dados e entramos em contato para agendar uma call ou conversar pelo WhatsApp.`,
      )}
      heading={i18n._(msg`Quer implementar o Zyra\n*na sua empresa?*`)}
      scheme="light"
    >
      <TalkToUsButton label={msg`Falar com a gente`} />
    </Signoff>
  );
}
