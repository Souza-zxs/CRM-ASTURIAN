import { markFunnelLeadAttended } from '@/funnel/api/mark-funnel-lead-attended';
import { useWorkshopSession } from '@/funnel/hooks/useWorkshopSession';
import { type FunnelWorkshopPageContent } from '@/funnel/types/FunnelPage';
import { formatWorkshopCountdown } from '@/funnel/utils/formatWorkshopCountdown';
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

const StyledCountdownCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: auto;
  max-width: 560px;
  text-align: center;
`;

const StyledCountdownLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledCountdownValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: 4rem;
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.1;
`;

const StyledCountdownHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const isEmbeddableVideoUrl = (url: string) =>
  url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

type WorkshopPageViewProps = {
  content: FunnelWorkshopPageContent;
};

const formatSessionStart = (startsAt: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(startsAt);

export const WorkshopPageView = ({ content }: WorkshopPageViewProps) => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('lead');
  const session = useWorkshopSession({ schedule: content.schedule, leadId });

  const isLive = session.status === 'live';

  // A lead only counts as an attendee once the workshop is actually on. An
  // effect is right here: it's a side effect of the page being shown, not of
  // an event.
  useEffect(() => {
    if (isLive && leadId !== null) {
      void markFunnelLeadAttended(leadId);
    }
  }, [isLive, leadId]);

  const salesPagePath = `/w/${content.ctaRedirectSlug}${
    leadId !== null ? `?lead=${encodeURIComponent(leadId)}` : ''
  }`;

  if (session.status === 'loading') {
    return null;
  }

  if (session.status === 'waiting') {
    return (
      <StyledPage>
        <StyledCountdownCard role="timer" aria-live="off">
          <StyledCountdownLabel>Seu workshop começa em</StyledCountdownLabel>
          <StyledCountdownValue>
            {formatWorkshopCountdown(session.secondsLeft)}
          </StyledCountdownValue>
          <StyledCountdownHint>
            Sessão de {formatSessionStart(session.startsAt)}. Mantenha esta
            página aberta: o vídeo libera sozinho quando a contagem chegar a
            zero.
          </StyledCountdownHint>
        </StyledCountdownCard>
      </StyledPage>
    );
  }

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
