import {
  ZYRA_STANDARD_APPLICATION_NAME,
  ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'zyra-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

// description is owned by the frontend (translated) — see getStandardApplicationDescription.
export const ZYRA_STANDARD_APPLICATION = {
  universalIdentifier: ZYRA_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: ZYRA_STANDARD_APPLICATION_NAME,
  description: null,
  version: '1.0.1',
  sourcePath: 'cli-sync',
  sourceType: ApplicationRegistrationSourceType.LOCAL,
} as const satisfies Pick<
  ApplicationEntity,
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
  | 'sourcePath'
  | 'sourceType'
>;
