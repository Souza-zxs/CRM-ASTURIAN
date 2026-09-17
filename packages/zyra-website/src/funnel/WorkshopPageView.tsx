import { styled } from '@linaria/react';
import { type FunnelWorkshopPageContent } from 'zyra-shared/types';

import { Button } from '@/ui/Button';
import { SectionShell } from '@/ui/SectionShell';
import { radius, spacing } from '@/tokens';

const VideoFrame = styled.div`
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: ${radius(2)};
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

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing(8)};
`;

const isEmbeddableVideoUrl = (url: string) =>
  url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

type WorkshopPageViewProps = {
  content: FunnelWorkshopPageContent;
};

export const WorkshopPageView = ({ content }: WorkshopPageViewProps) => {
  return (
    <SectionShell rhythm="spacious" scheme="dark">
      <VideoFrame>
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
      </VideoFrame>
      <CtaRow>
        <Button href={`/w/${content.ctaRedirectSlug}`} label={content.ctaLabel} />
      </CtaRow>
    </SectionShell>
  );
};
