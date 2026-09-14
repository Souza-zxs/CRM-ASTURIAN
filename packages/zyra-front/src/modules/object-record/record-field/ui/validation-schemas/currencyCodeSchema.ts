import { z } from 'zod';

import { CurrencyCode } from 'zyra-shared/constants';

export const currencyCodeSchema = z.enum(CurrencyCode);
