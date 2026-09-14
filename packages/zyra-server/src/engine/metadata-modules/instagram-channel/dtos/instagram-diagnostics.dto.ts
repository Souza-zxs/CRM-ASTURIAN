import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsInt } from 'class-validator';

// GraphQL-facing enum (allowed per project convention, which otherwise
// prefers string literals) describing the health of the channel's stored
// long-lived access token, derived from
// InstagramChannelEntity.accessTokenExpiresAt.
export enum InstagramTokenStatus {
  VALID = 'VALID',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(InstagramTokenStatus, { name: 'InstagramTokenStatus' });

@ObjectType('InstagramDiagnostics')
export class InstagramDiagnosticsDTO {
  @Field(() => Date, { nullable: true })
  lastWebhookReceivedAt: Date | null;

  @Field(() => Date, { nullable: true })
  lastReconciliationAt: Date | null;

  @IsEnum(InstagramTokenStatus)
  @Field(() => InstagramTokenStatus)
  tokenStatus: InstagramTokenStatus;

  @IsInt()
  @Field()
  pendingJobsCount: number;

  @IsInt()
  @Field()
  failedJobsCount: number;
}
