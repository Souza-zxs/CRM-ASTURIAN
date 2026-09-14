'use client';

import { useLocation } from 'react-router-dom';

import { stripLocale } from './strip-locale';

export const useUnlocalizedPathname = (): string =>
  stripLocale(useLocation().pathname);
