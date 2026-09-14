/* @license Enterprise */

import { type ObjectRecord } from 'zyra-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/zyra-orm/interfaces/workspace-internal-context.interface';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ZyraORMException,
  ZyraORMExceptionCode,
} from 'src/engine/zyra-orm/exceptions/zyra-orm.exception';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/zyra-orm/utils/build-row-level-permission-record-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/zyra-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';

type ValidateRLSPredicatesForRecordsArgs<T extends ObjectLiteral> = {
  records: T[];
  objectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  shouldBypassPermissionChecks: boolean;
  errorMessage?: string;
};

export const validateRLSPredicatesForRecords = <T extends ObjectLiteral>({
  records,
  objectMetadata,
  internalContext,
  authContext,
  shouldBypassPermissionChecks,
  errorMessage = 'Record does not satisfy row-level security constraints of your current role',
}: ValidateRLSPredicatesForRecordsArgs<T>): void => {
  if (shouldBypassPermissionChecks) {
    return;
  }

  const userWorkspaceId = isUserAuthContext(authContext)
    ? authContext.userWorkspaceId
    : undefined;
  const roleId = userWorkspaceId
    ? internalContext.userWorkspaceRoleMap[userWorkspaceId]
    : undefined;

  if (!roleId) {
    return;
  }

  const recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      internalContext.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      internalContext.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    objectMetadata,
    roleId,
    workspaceMember: isUserAuthContext(authContext)
      ? authContext.workspaceMember
      : undefined,
  });

  if (!recordFilter || Object.keys(recordFilter).length === 0) {
    return;
  }

  for (const record of records) {
    const matchesRLS = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: record as unknown as ObjectRecord,
      filter: recordFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    });

    if (!matchesRLS) {
      throw new ZyraORMException(
        errorMessage,
        ZyraORMExceptionCode.RLS_VALIDATION_FAILED,
      );
    }
  }
};
