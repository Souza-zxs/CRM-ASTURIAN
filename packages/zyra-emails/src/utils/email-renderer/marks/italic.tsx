import { type ReactNode } from 'react';
import { type TipTapMark } from 'zyra-shared/utils';

export const italic = (_: TipTapMark, children: ReactNode): ReactNode => {
  return <em>{children}</em>;
};
