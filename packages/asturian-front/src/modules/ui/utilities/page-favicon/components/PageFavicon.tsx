import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { brandState } from '@/client-config/states/brandState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getImageAbsoluteURI } from 'zyra-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const brand = useAtomStateValue(brandState);

  // A workspace's own logo always wins; otherwise fall back to the
  // instance-wide brand logo (whitelabel) before the hardcoded Zyra asset.
  const faviconHref = workspacePublicData?.logo
    ? (getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      }) ?? DEFAULT_WORKSPACE_LOGO)
    : brand?.logoUrl || DEFAULT_WORKSPACE_LOGO;

  return (
    <Helmet>
      <link rel="icon" type="image/x-icon" href={faviconHref} />
    </Helmet>
  );
};
