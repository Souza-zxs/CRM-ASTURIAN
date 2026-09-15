import { type FunnelWorkshopPageContent } from '@/types/FunnelPageContent';
import { Link } from 'react-router-dom';

type WorkshopPageViewProps = {
  content: FunnelWorkshopPageContent;
};

const isEmbeddableVideoUrl = (url: string) =>
  url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

export const WorkshopPageView = ({ content }: WorkshopPageViewProps) => {
  return (
    <main className="page page--workshop">
      <div className="workshop-video">
        {isEmbeddableVideoUrl(content.videoUrl) ? (
          <iframe
            src={content.videoUrl}
            title="Workshop"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={content.videoUrl} controls />
        )}
      </div>
      {content.chatEnabled && (
        <aside className="workshop-chat">
          <h2>Chat</h2>
          <p>O chat ao vivo aparece aqui.</p>
        </aside>
      )}
      <div className="workshop-cta">
        <Link to={`/${content.ctaRedirectSlug}`} className="button">
          {content.ctaLabel}
        </Link>
      </div>
    </main>
  );
};
