import { isDefined } from 'zyra-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type ZyraORMException,
  ZyraORMExceptionCode,
} from 'src/engine/zyra-orm/exceptions/zyra-orm.exception';

interface DuplicateKeyErrorWithMetadata extends ZyraORMException {
  conflictingRecordId?: string;
  conflictingObjectNameSingular?: string;
}

export const zyraORMGraphqlApiExceptionHandler = (
  error: ZyraORMException,
) => {
  switch (error.code) {
    case ZyraORMExceptionCode.DUPLICATE_ENTRY_DETECTED: {
      const duplicateKeyError: DuplicateKeyErrorWithMetadata = error;

      const extensions: Record<string, unknown> = {
        userFriendlyMessage: error.userFriendlyMessage,
        ...(isDefined(duplicateKeyError.conflictingRecordId) &&
        isDefined(duplicateKeyError.conflictingObjectNameSingular)
          ? {
              conflictingRecordId: duplicateKeyError.conflictingRecordId,
              conflictingObjectNameSingular:
                duplicateKeyError.conflictingObjectNameSingular,
            }
          : {}),
      };

      throw new UserInputError(error.message, extensions);
    }

    case ZyraORMExceptionCode.INVALID_INPUT:
    case ZyraORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case ZyraORMExceptionCode.CONNECT_NOT_ALLOWED:
    case ZyraORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
    case ZyraORMExceptionCode.RLS_VALIDATION_FAILED:
    case ZyraORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
