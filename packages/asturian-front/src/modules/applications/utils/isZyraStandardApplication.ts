import { ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'zyra-shared/application';
import { isDefined } from 'zyra-shared/utils';

type ApplicationLike = {
  universalIdentifier?: string | null;
};

export const isZyraStandardApplication = (
  application: ApplicationLike | null | undefined,
): boolean =>
  isDefined(application?.universalIdentifier) &&
  application.universalIdentifier ===
    ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;
