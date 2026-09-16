import { type ReactNode } from 'react';

import { brandState } from '@/client-config/states/brandState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ZyraMark } from 'zyra-ui/icon';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  height: 100dvh;
  width: 100%;
`;

const StyledBrandPanel = styled.div`
  align-items: center;
  background: linear-gradient(
    160deg,
    ${themeCssVariables.accent.accent9} 0%,
    ${themeCssVariables.accent.accent12} 100%
  );
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  padding: ${themeCssVariables.spacing[20]};

  @media (max-width: 767px) {
    display: none;
  }
`;

const StyledBrandContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  max-width: 420px;
`;

const StyledBrandTagline = styled.p`
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
`;

const StyledFormPanel = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[8]};

  @media (max-width: 767px) {
    flex: 1 1 100%;
  }
`;

const StyledFormContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 360px;
`;

type AuthSplitLayoutProps = {
  children: ReactNode;
};

// Full-page alternative to the modal-over-blurred-mockup pattern used on
// /welcome — a distinct entry surface for the marketing site's /login and
// /cadastro links, while /welcome (and other flows that render SignInUp,
// like /invite) keep the original modal treatment unchanged.
export const AuthSplitLayout = ({ children }: AuthSplitLayoutProps) => {
  const { t } = useLingui();
  const brand = useAtomStateValue(brandState);

  return (
    <StyledContainer>
      <StyledBrandPanel>
        <StyledBrandContent>
          <ZyraMark showBackground={false} sizePx={56} />
          <StyledBrandTagline>
            {brand?.tagline || t`O CRM que se adapta ao seu jeito de vender.`}
          </StyledBrandTagline>
        </StyledBrandContent>
      </StyledBrandPanel>
      <StyledFormPanel>
        <StyledFormContent>{children}</StyledFormContent>
      </StyledFormPanel>
    </StyledContainer>
  );
};
