import { styled } from '@linaria/react';
import { type FunnelConfirmationPageContent } from 'zyra-shared/types';

import { Button } from '@/ui/Button';
import { SectionShell } from '@/ui/SectionShell';
import { spacing } from '@/tokens';

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: ${spacing(6)};
`;

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

type ConfirmationPageViewProps = {
  content: FunnelConfirmationPageContent;
};

export const ConfirmationPageView = ({
  content,
}: ConfirmationPageViewProps) => {
  const href = isExternalUrl(content.nextStepUrl)
    ? content.nextStepUrl
    : `/w/${content.nextStepUrl}`;

  return (
    <SectionShell rhythm="hero" scheme="light">
      <Message>{content.message}</Message>
      <Button href={href} label={content.nextStepLabel} />
    </SectionShell>
  );
};
