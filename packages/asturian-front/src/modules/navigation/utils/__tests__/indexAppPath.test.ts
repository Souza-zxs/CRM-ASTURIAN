import { AppPath } from 'zyra-shared/types';
import indexAppPath from '@/navigation/utils/indexAppPath';

describe('getIndexAppPath', () => {
  it('returns the index app path', () => {
    const { getIndexAppPath } = indexAppPath;
    expect(getIndexAppPath()).toEqual(AppPath.Index);
  });
});
