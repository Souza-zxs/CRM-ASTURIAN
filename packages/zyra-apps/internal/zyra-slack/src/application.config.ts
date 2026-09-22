import { defineApplication } from 'zyra-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Zyra Slack',
  description:
    'Connect Slack to Zyra. Each workspace member (or a shared workspace connection) can authenticate Slack; workflow steps then post messages, ephemerals, updates, deletes, and reactions on behalf of that connection.',
  logoUrl: 'public/zyra-slack.svg',
  author: 'Zyra',
  category: 'Communication',
  aboutDescription:
    'Official Slack connector for Zyra CRM. Install a Slack app on api.slack.com, add the OAuth client ID and secret as server variables, then connect Slack per member or as a shared workspace connection. Use workflow actions to post, update, or delete messages, send ephemeral notes, and add reactions using the connected account.',
  websiteUrl: 'https://docs.zyra.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.zyra.com/terms',
  emailSupport: 'contact@zyra.com',
  issueReportUrl: 'https://github.com/zyrahq/zyra/issues',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  serverVariables: {
    SLACK_CLIENT_ID: {
      description:
        'OAuth client ID from your Slack app (api.slack.com/apps). Public in OAuth flows; only the client secret must stay confidential.',
      isSecret: false,
      isRequired: true,
    },
    SLACK_CLIENT_SECRET: {
      description:
        'OAuth client secret from your Slack app. Stored encrypted; never exposed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
