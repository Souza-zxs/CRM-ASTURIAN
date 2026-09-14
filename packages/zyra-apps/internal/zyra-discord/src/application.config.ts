import { defineApplication } from 'zyra-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DISCORD_BOT_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Zyra Discord',
  description:
    'Connect Discord to Zyra. Workflow steps post, update, and delete bot messages and add reactions using a Discord bot token shared across the deployment.',
  logoUrl: 'public/zyra-discord.svg',
  author: 'Zyra',
  category: 'Communication',
  aboutDescription:
    'Official Discord connector for Zyra CRM. Create a Discord application at https://discord.com/developers/applications, copy its bot token into the DISCORD_BOT_TOKEN application variable, then invite the bot to each server you want workflows to post in. Use workflow actions to post, update, or delete bot messages and add reactions.',
  websiteUrl: 'https://docs.zyra.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.zyra.com/terms',
  emailSupport: 'contact@zyra.com',
  issueReportUrl: 'https://github.com/zyrahq/zyra/issues',
  applicationVariables: {
    DISCORD_BOT_TOKEN: {
      universalIdentifier: DISCORD_BOT_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Bot token from your Discord application (Developer Portal → Bot tab → Reset Token). Used with the `Bot` auth prefix to call the Discord REST API. The same token authenticates the bot across every guild it has been invited to.',
      isSecret: true,
    },
  },
});
