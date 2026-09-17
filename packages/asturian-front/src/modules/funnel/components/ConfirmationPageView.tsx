import { type FunnelConfirmationPageContent } from '@/funnel/types/FunnelPage';
import { styled } from '@linaria/react';
import { Button } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledPage = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  justify-content: center;
  min-height: 100dvh;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledMessage = styled.p`
  font-size: 1.2rem;
  max-width: 560px;
`;

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

type ConfirmationPageViewProps = {
  content: FunnelConfirmationPageContent;
};

export const ConfirmationPageView = ({
  content,
}: ConfirmationPageViewProps) => {
  return (
    <StyledPage>
      <StyledMessage>{content.message}</StyledMessage>
      {isExternalUrl(content.nextStepUrl) ? (
        <Button
          title={content.nextStepLabel}
          onClick={() => {
            window.location.href = content.nextStepUrl;
          }}
        />
      ) : (
        <Button
          title={content.nextStepLabel}
          to={`/w/${content.nextStepUrl}`}
        />
      )}
    </StyledPage>
  );
};
