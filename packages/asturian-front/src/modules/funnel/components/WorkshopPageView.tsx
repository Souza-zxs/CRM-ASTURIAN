import { type FunnelWorkshopPageContent } from '@/funnel/types/FunnelPage';
import { styled } from '@linaria/react';
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
      <Button title={content.ctaLabel} to={`/w/${content.ctaRedirectSlug}`} />
    </StyledPage>
  );
};
