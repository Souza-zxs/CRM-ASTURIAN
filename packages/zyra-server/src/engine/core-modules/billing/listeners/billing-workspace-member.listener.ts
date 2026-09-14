/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordCreateEvent } from 'zyra-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import {
  UpdateSubscriptionQuantityJob,
  type UpdateSubscriptionQuantityJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class BillingWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly zyraConfigService: ZyraConfigService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  async handleCreateOrDeleteEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    if (!this.zyraConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    await this.messageQueueService.add<UpdateSubscriptionQuantityJobData>(
      UpdateSubscriptionQuantityJob.name,
      { workspaceId: payload.workspaceId },
    );
  }
}
