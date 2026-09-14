import { ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'zyra-shared/application';
import { isDefined } from 'zyra-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export const getZyraStandardApplicationIdOrThrow = (
  flatApplicationMaps: FlatApplicationCacheMaps,
): string => {
  const zyraStandardApplicationId =
    flatApplicationMaps.idByUniversalIdentifier[
      ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(zyraStandardApplicationId)) {
    throw new ApplicationException(
      'Could not find the zyra-standard application in the workspace cache',
      ApplicationExceptionCode.APPLICATION_NOT_FOUND,
    );
  }

  return zyraStandardApplicationId;
};
