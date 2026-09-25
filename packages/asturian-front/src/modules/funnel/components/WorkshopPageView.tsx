import { markFunnelLeadAttended } from '@/funnel/api/mark-funnel-lead-attended';
import { type FunnelWorkshopPageContent } from '@/funnel/types/FunnelPage';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledPage = styled.div`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  min-height: 100dvh;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
`;

const StyledVideoFrame = styled.div`
  aspect-ratio: 16 / 9;
  background: ${themeCssVariables.grayScale.gray10};
  border-radius: ${themeCssVariables.border.radius.md};
  max-width: 960px;
  overflow: hidden;
  position: relative;
  width: 100%;

  iframe,
  video {
    border: none;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

const isEmbeddableVideoUrl = (url: string) =>
  url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

type WorkshopPageViewProps = {
  content: FunnelWorkshopPageContent;
};

export const WorkshopPageView = ({ content }: WorkshopPageViewProps) => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('lead');

  // Opening the workshop page is what makes a lead an attendee. An effect is
  // right here: it's a side effect of the page being shown, not of an event.
  useEffect(() => {
    if (leadId !== null) {
      void markFunnelLeadAttended(leadId);
    }
  }, [leadId]);

  const salesPagePath = `/w/${content.ctaRedirectSlug}${
    leadId !== null ? `?lead=${encodeURIComponent(leadId)}` : ''
  }`;

  return (
    <StyledPage>
      <StyledVideoFrame>
        {isEmbeddableVideoUrl(content.videoUrl) ? (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-presentation allow-popups"
            src={content.videoUrl}
            title="Workshop"
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={content.videoUrl} />
        )}
      </StyledVideoFrame>
      <Button title={content.ctaLabel} to={salesPagePath} />
    </StyledPage>
  );
};
