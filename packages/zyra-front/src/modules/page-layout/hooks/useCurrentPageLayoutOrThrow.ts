import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isDefined } from 'zyra-shared/utils';

export const useCurrentPageLayoutOrThrow = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(currentPageLayout)) {
    throw new Error('No current page layout found');
  }

  return { currentPageLayout };
};
