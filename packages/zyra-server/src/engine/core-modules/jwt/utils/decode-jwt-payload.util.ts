import * as jwt from 'jsonwebtoken';
import { isDefined } from 'zyra-shared/utils';

export const decodeJwtPayload = <T>(rawJwtToken: string): T | undefined => {
  try {
    const decoded = jwt.decode(rawJwtToken, { json: true });

    if (!isDefined(decoded)) {
      return undefined;
    }

    return decoded as T;
  } catch {
    return undefined;
  }
};
