import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Body, Eyebrow, Heading, SectionIntro, SectionShell, SectionStack, Signoff } from '@/ui';

export function Creators() {
  const i18n = getServerI18n();

  return (
    <>
      <SectionShell rhythm="hero" scheme="light">
        <SectionStack>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Sobre nós`)}</Eyebrow>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Quem criou o *Zyra*`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`O Zyra é criado e mantido pela Horizon, uma empresa de tecnologia que desenvolve software para equipes comerciais venderem com mais organização e menos trabalho manual.`,
              )}
            </Body>
            <Body muted size="md">
              {i18n._(
                msg`O produto reúne em um só lugar CRM, dashboards, WhatsApp, Instagram, agente de voz e páginas de funil.`,
              )}
            </Body>
          </SectionIntro>
        </SectionStack>
      </SectionShell>
      <Signoff
        body={i18n._(
          msg`A implementação é feita diretamente com a nossa equipe. Deixe seus dados e entramos em contato para agendar uma call ou conversar pelo WhatsApp.`,
        )}
        heading={i18n._(msg`Quer implementar o Zyra\n*na sua empresa?*`)}
        scheme="dark"
      >
        <TalkToUsButton label={msg`Falar com a gente`} />
      </Signoff>
    </>
  );
}
