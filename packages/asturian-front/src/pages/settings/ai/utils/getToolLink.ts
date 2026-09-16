import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { SettingsPath } from 'zyra-shared/types';
import { getSettingsPath } from 'zyra-shared/utils';

export const getToolLink = (tool: SettingsAgentToolItem): string =>
  getSettingsPath(SettingsPath.AiToolDetail, {
    toolIdentifier: tool.identifier,
  });
