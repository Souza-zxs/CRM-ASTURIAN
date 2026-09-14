import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { type AssistantResponseStreamingStage } from './assistant-response-stage';
import { type StreamingSegment } from './StreamingText';

const terminal = APP_PREVIEW_TONES.terminal;

const InlineCode = styled.span`
  background: ${terminal.surface.inlineCode};
  border-radius: 3px;
  color: ${terminal.text.inlineCode};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 12px;
  padding: 1px 5px;
`;

const FileLink = styled.span`
  color: ${terminal.text.fileLink};
  cursor: pointer;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const ReferenceLink = styled.a`
  color: ${terminal.text.fileLink};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${terminal.text.fileLinkHover};
  }
`;

const text = (value: string, onReveal?: () => void): StreamingSegment => ({
  kind: 'text',
  value,
  onReveal,
});

const node = (
  key: string,
  value: ReactNode,
  onReveal?: () => void,
): StreamingSegment => ({
  kind: 'node',
  value: <span key={key}>{value}</span>,
  onReveal,
});

const ROCKET_ID = 'rockets';
const LAUNCH_ID = 'launches';
const PAYLOAD_ID = 'payloads';
const COMPANIES_ID = 'companies';
const LAUNCH_SITE_ID = 'launch-sites';

const buildIntroAndRocketParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text(
    'Vou montar um CRM de operações de lançamento no seu workspace: quatro objetos novos, além do padrão ',
  ),
  node('rocket-companies', <InlineCode>Companies</InlineCode>),
  text(' pros clientes, com UUIDs compartilhados em '),
  node('rocket-ids', <FileLink>schema-identifiers.ts</FileLink>),
  text('. Primeiro: '),
  node(
    'rocket-chip',
    <InlineCode>Rocket</InlineCode>,
    onObjectCreated ? () => onObjectCreated(ROCKET_ID) : undefined,
  ),
  text(
    '. Cada veículo ganha número de série, fabricante, status do ciclo de vida, reutilização, data de lançamento, dimensões e órbita alvo em ',
  ),
  node('rocket-file', <FileLink>rocket.object.ts</FileLink>),
  text('.'),
];

const buildLaunchParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Em seguida: '),
  node(
    'launch-chip',
    <InlineCode>Launch</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_ID) : undefined,
  ),
  text(
    '. Cada missão ganha um código único, status, tipo de missão, horários planejado e real de lançamento, e um resumo. Definido em ',
  ),
  node('launch-file', <FileLink>launch.object.ts</FileLink>),
  text('.'),
];

const buildPayloadParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Agora '),
  node(
    'payload-chip',
    <InlineCode>Payload</InlineCode>,
    onObjectCreated ? () => onObjectCreated(PAYLOAD_ID) : undefined,
  ),
  text(
    '. Isso cobre o que realmente voa: satélites, cápsulas tripuladas, carga, sondas e módulos de pouso, com tipo, status, órbita alvo, massa e referência do cliente. Definido em ',
  ),
  node('payload-file', <FileLink>payload.object.ts</FileLink>),
  text('.'),
];

const buildCustomerParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Pra clientes, não precisa de objeto novo. Reaproveito o padrão '),
  node(
    'customer-chip',
    <InlineCode>Companies</InlineCode>,
    onObjectCreated ? () => onObjectCreated(COMPANIES_ID) : undefined,
  ),
  text(
    ' que já vem com a Zyra, então contas, favicons de domínio e a relação com Pessoas funcionam de graça. ',
  ),
  node('customer-file', <FileLink>payload.object.ts</FileLink>),
  text(' aponta sua relação '),
  node('customer-field', <InlineCode>customer</InlineCode>),
  text(' direto pra lá.'),
];

const buildLaunchSiteParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Último objeto: '),
  node(
    'launch-site-chip',
    <InlineCode>Launch site</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_SITE_ID) : undefined,
  ),
  text(
    '. Isso cobre plataformas e bases com código do local, país, região, nome da plataforma e status operacional. Fica em ',
  ),
  node('launch-site-file', <FileLink>launch-site.object.ts</FileLink>),
  text('.'),
];

const PINNED_ACTIONS_PARAGRAPH: StreamingSegment[] = [
  text(
    'Cada objeto também ganha de 2 a 3 comandos rápidos relevantes fixados no cabeçalho. Ao lado de ',
  ),
  node('pa-new', <InlineCode>New</InlineCode>),
  text(', '),
  node('pa-rocket', <InlineCode>Rocket</InlineCode>),
  text(' tem atalhos de reutilizar/aposentar, '),
  node('pa-launch', <InlineCode>Launch</InlineCode>),
  text(' tem '),
  node('pa-l-resched', <InlineCode>Reschedule</InlineCode>),
  text(' e '),
  node('pa-l-payload', <InlineCode>Add payload</InlineCode>),
  text(', '),
  node('pa-payload', <InlineCode>Payload</InlineCode>),
  text(' tem '),
  node('pa-p-book', <InlineCode>Book slot</InlineCode>),
  text(', '),
  node('pa-companies', <InlineCode>Companies</InlineCode>),
  text(' tem um '),
  node('pa-c-status', <InlineCode>Set status</InlineCode>),
  text(' rápido, e '),
  node('pa-site', <InlineCode>Launch site</InlineCode>),
  text(' tem '),
  node('pa-s-window', <InlineCode>Book window</InlineCode>),
  text('. Definidos em '),
  node('pa-folder', <FileLink>src/command-menu-items/</FileLink>),
  text('.'),
];

const WRAPUP_PARAGRAPH: StreamingSegment[] = [
  text('As relações conectam '),
  node('w-rl', <InlineCode>Rocket → Launches</InlineCode>),
  text(', '),
  node('w-sl', <InlineCode>LaunchSite → Launches</InlineCode>),
  text(', '),
  node('w-cp', <InlineCode>Company → Payloads</InlineCode>),
  text(', e '),
  node('w-lp', <InlineCode>Launch → Payloads</InlineCode>),
  text('. Cada objeto ganha uma view de índice e entrada na barra lateral; '),
  node('w-launches', <InlineCode>Launches</InlineCode>),
  text(' também tem '),
  node('w-upcoming', <FileLink>upcoming-launches.view.ts</FileLink>),
  text(' e '),
  node('w-past', <FileLink>past-launches.view.ts</FileLink>),
  text('. Verificado com '),
  node('w-lint', <InlineCode>yarn lint</InlineCode>),
  text(', '),
  node('w-tsc', <InlineCode>tsc --noEmit</InlineCode>),
  text(', '),
  node(
    'w-vitest',
    <InlineCode>vitest run schema.integration-test.ts</InlineCode>,
  ),
  text(', e '),
  node('w-dev', <InlineCode>yarn zyra dev --once</InlineCode>),
  text('. Referência: '),
  node(
    'w-docs',
    <ReferenceLink
      href="https://zyra.com/developers"
      onClick={(event) => event.preventDefault()}
    >
      Documentação de apps da Zyra
    </ReferenceLink>,
  ),
  text('.'),
];

export const buildAssistantResponseSegments = (
  onObjectCreated?: (id: string) => void,
): Record<AssistantResponseStreamingStage, StreamingSegment[]> => ({
  actions: PINNED_ACTIONS_PARAGRAPH,
  customer: buildCustomerParagraph(onObjectCreated),
  launch: buildLaunchParagraph(onObjectCreated),
  launchSite: buildLaunchSiteParagraph(onObjectCreated),
  payload: buildPayloadParagraph(onObjectCreated),
  rocket: buildIntroAndRocketParagraph(onObjectCreated),
  wrapup: WRAPUP_PARAGRAPH,
});
