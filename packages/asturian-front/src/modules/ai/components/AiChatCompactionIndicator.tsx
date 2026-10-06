import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useLingui } from '@lingui/react/macro';
import { IconTransform } from 'zyra-ui/icon';
import { ThemeContext, themeCssVariables } from 'zyra-ui/theme-constants';

const StyledIndicatorContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledIconTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AiChatCompactionIndicator = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  return (
    <StyledIndicatorContainer>
      <StyledIconTextContainer>
        <IconTransform size={theme.icon.size.sm} />
        <div>{t`The conversation has been compacted`}</div>
      </StyledIconTextContainer>
    </StyledIndicatorContainer>
  );
};
