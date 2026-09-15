import { type FunnelConfirmationPageContent } from '@/types/FunnelPageContent';
import { Link } from 'react-router-dom';

type ConfirmationPageViewProps = {
  content: FunnelConfirmationPageContent;
};

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

export const ConfirmationPageView = ({
  content,
}: ConfirmationPageViewProps) => {
  return (
    <main className="page page--confirmation">
      <p className="confirmation-message">{content.message}</p>
      {isExternalUrl(content.nextStepUrl) ? (
        <a href={content.nextStepUrl} className="button">
          {content.nextStepLabel}
        </a>
      ) : (
        <Link to={`/${content.nextStepUrl}`} className="button">
          {content.nextStepLabel}
        </Link>
      )}
    </main>
  );
};
