import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import ModelContextProtocolLogo from '@/settings/playground/assets/model-context-protocol-logo.svg?react';
import { H2Title } from 'zyra-ui/typography';
import { CodeEditor, CoreEditorHeader } from 'zyra-ui/input';
import { Section } from 'zyra-ui/layout';
import { themeCssVariables } from 'zyra-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledMcpEditorHeaderTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMcpIcon = styled(ModelContextProtocolLogo)`
  color: inherit;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const buildMcpConfig = (serverUrl: string) =>
  `{
  "mcpServers": {
    "zyra": {
      "url": "${serverUrl}/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;

export const SettingsMcpSetup = () => {
  const { t } = useLingui();
  const mcpConfig = buildMcpConfig(REACT_APP_SERVER_BASE_URL);

  return (
    <Section>
      <H2Title
        title={t`Connect your AI assistant`}
        description={t`Paste this configuration into MCP-aware clients like Claude, Codex, or Cursor.`}
      />
      <CoreEditorHeader
        leftNodes={[
          <StyledMcpEditorHeaderTitle>
            <StyledMcpIcon aria-hidden focusable={false} />
            <span>{t`MCP client configuration`}</span>
          </StyledMcpEditorHeaderTitle>,
        ]}
        rightNodes={[<LightCopyIconButton copyText={mcpConfig} />]}
      />
      <CodeEditor
        value={mcpConfig}
        language="json"
        variant="with-header"
        contentPadding="comfortable"
        autoHeight
        options={{
          readOnly: true,
          domReadOnly: true,
          lineNumbers: 'off',
          lineNumbersMinChars: 0,
          folding: false,
          glyphMargin: false,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          wordWrap: 'on',
        }}
      />
    </Section>
  );
};
