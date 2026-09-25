import { META_PIXEL_ID } from '@/funnel/config';
import {
  type FunnelTrackingConsentChoice,
  readFunnelTrackingConsent,
  saveFunnelTrackingConsent,
} from '@/funnel/utils/funnelTrackingConsent';
import {
  initializeMetaPixel,
  trackMetaPixelEvent,
} from '@/funnel/utils/metaPixel';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { Button } from 'zyra-ui/input';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledBanner = styled.div`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray1};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: ${themeCssVariables.spacing[4]};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  left: 50%;
  max-width: 640px;
  padding: ${themeCssVariables.spacing[4]};
  position: fixed;
  transform: translateX(-50%);
  width: calc(100% - ${themeCssVariables.spacing[8]});
  z-index: 1000;
`;

const StyledText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1 1 260px;
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type FunnelTrackingConsentProps = {
  // Changes with every funnel page: a new page is a new PageView for the pixel
  // even though the SPA never reloads.
  pageKey: string;
};

// Renders nothing when no pixel is configured. Otherwise it asks once, and the
// pixel script is only added to the page after a "yes" (LGPD): declining, or
// never answering, means nothing is loaded and nothing is sent to Meta.
export const FunnelTrackingConsent = ({
  pageKey,
}: FunnelTrackingConsentProps) => {
  const [consent, setConsent] = useState<FunnelTrackingConsentChoice | null>(
    readFunnelTrackingConsent,
  );

  const isPixelConfigured = isNonEmptyString(META_PIXEL_ID);

  useEffect(() => {
    if (!isPixelConfigured || consent !== 'granted') {
      return;
    }

    initializeMetaPixel(META_PIXEL_ID);
    trackMetaPixelEvent({ eventName: 'PageView' });
  }, [isPixelConfigured, consent, pageKey]);

  const handleChoice = (choice: FunnelTrackingConsentChoice) => {
    saveFunnelTrackingConsent(choice);
    setConsent(choice);
  };

  if (!isPixelConfigured || consent !== null) {
    return null;
  }

  return (
    <StyledBanner role="dialog" aria-label="Aviso de cookies e anúncios">
      <StyledText>
        Usamos um pixel de anúncios para medir o resultado das nossas campanhas.
        Ele só é ativado se você aceitar, e não enviamos seu nome, e-mail ou
        telefone.
      </StyledText>
      <StyledActions>
        <Button title="Recusar" onClick={() => handleChoice('denied')} />
        <Button
          title="Aceitar"
          accent="blue"
          onClick={() => handleChoice('granted')}
        />
      </StyledActions>
    </StyledBanner>
  );
};
