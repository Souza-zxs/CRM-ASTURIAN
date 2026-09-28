import { type FunnelConfirmationPageContent } from '@/funnel/types/FunnelPage';
import { getConfirmationStatusTone } from '@/funnel/utils/getConfirmationStatusTone';
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

const StyledStatusBadge = styled.div<{ tone: 'success' | 'declined' }>`
  align-items: center;
  background: ${({ tone }) =>
    tone === 'declined' ? themeCssVariables.color.red : themeCssVariables.color.green};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
`;

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

type ConfirmationPageViewProps = {
  content: FunnelConfirmationPageContent;
};

export const ConfirmationPageView = ({
  content,
}: ConfirmationPageViewProps) => {
  const tone = getConfirmationStatusTone(content.variant);

  return (
    <StyledPage>
      <StyledStatusBadge aria-hidden tone={tone}>
        {tone === 'declined' ? (
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>
        ) : (
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path
              d="M5 12.5L10 17.5L19 7.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        )}
      </StyledStatusBadge>
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
