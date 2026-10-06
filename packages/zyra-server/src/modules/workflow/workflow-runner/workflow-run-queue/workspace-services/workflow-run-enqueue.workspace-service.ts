import { Injectable, Logger } from '@nestjs/common';

import { MoreThanOrEqual } from 'typeorm';
import { QUERY_MAX_RECORDS } from 'zyra-shared/constants';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { PlanLimitService } from 'src/engine/core-modules/plan-tier/services/plan-limit.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { NOT_STARTED_RUNS_FIND_OPTIONS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/not-started-runs-find-options';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Injectable()
export class WorkflowRunEnqueueWorkspaceService {
  private readonly logger = new Logger(WorkflowRunEnqueueWorkspaceService.name);
  constructor(
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
    private readonly planLimitService: PlanLimitService,
  ) {}

  async enqueueRunsForWorkspace({
    workspaceId,
    isCacheMode,
  }: {
    workspaceId: string;
    isCacheMode: boolean;
  }) {
    const lockAcquired =
      await this.workflowThrottlingWorkspaceService.acquireWorkflowEnqueueLock(
        workspaceId,
      );

    if (!lockAcquired) {
      return;
    }

    try {
      const authContext = buildSystemAuthContext(workspaceId);

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkflowRunWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          const notStartedRunsCount = isCacheMode
            ? await this.workflowThrottlingWorkspaceService.getNotStartedRunsCountFromCache(
                workspaceId,
              )
            : await this.workflowThrottlingWorkspaceService.getNotStartedRunsCountFromDatabase(
                workspaceId,
              );

          if (notStartedRunsCount <= 0) {
            await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
              workspaceId,
            );

            return;
          }

          let remainingWorkflowRunToEnqueueCount =
            await this.workflowThrottlingWorkspaceService.getRemainingRunsToEnqueueCount(
              workspaceId,
            );

          // Monthly plan limit, separate from the short-window throttle
          // above (that one protects infra/cost right now, this one is the
          // commercial "N executions included this month"). Soft cap, not a
          // thrown exception — this is a background cron, not a user
          // action; runs that don't fit stay NOT_STARTED and get picked up
          // next month (or immediately if the workspace adds the module).
          const startOfMonth = new Date();

          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const monthlyRunCount = await workflowRunRepository.count({
            where: { createdAt: MoreThanOrEqual(startOfMonth.toISOString()) },
          });

          const monthlyExecutionLimit = await this.planLimitService.resolveLimit(
            workspaceId,
            'maxWorkflowExecutionsMonthly',
          );

          const remainingMonthlyAllowance = Math.max(
            0,
            monthlyExecutionLimit - monthlyRunCount,
          );

          remainingWorkflowRunToEnqueueCount = Math.min(
            remainingWorkflowRunToEnqueueCount,
            remainingMonthlyAllowance,
          );

          let totalEnqueuedCount = 0;

          while (remainingWorkflowRunToEnqueueCount > 0) {
            const batchSize = Math.min(
              remainingWorkflowRunToEnqueueCount,
              QUERY_MAX_RECORDS,
            );

            const batchRuns = await workflowRunRepository.find({
              where: NOT_STARTED_RUNS_FIND_OPTIONS,
              select: {
                id: true,
              },
              order: {
                createdAt: 'ASC',
              },
              take: batchSize,
            });

            if (batchRuns.length === 0) {
              break;
            }

            const batchIds = batchRuns.map(
              (workflowRun: WorkflowRunWorkspaceEntity) => workflowRun.id,
            );

            await workflowRunRepository.update(batchIds, {
              enqueuedAt: new Date().toISOString(),
              status: WorkflowRunStatus.ENQUEUED,
            });

            for (const workflowRunId of batchIds) {
              await this.messageQueueService.add<RunWorkflowJobData>(
                RunWorkflowJob.name,
                {
                  workflowRunId,
                  workspaceId,
                },
              );
            }

            totalEnqueuedCount += batchRuns.length;
            remainingWorkflowRunToEnqueueCount -= batchRuns.length;
          }

          if (totalEnqueuedCount === 0) {
            if (!isCacheMode) {
              await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
                workspaceId,
              );
            }

            return;
          }

          await this.workflowThrottlingWorkspaceService.consumeRemainingRunsToEnqueueCount(
            workspaceId,
            totalEnqueuedCount,
          );

          if (isCacheMode) {
            await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
              workspaceId,
              totalEnqueuedCount,
            );
          } else {
            await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
              workspaceId,
            );
          }
        },
        authContext,
      );
    } catch (error) {
      try {
        await this.metricsService.incrementCounterForEvent({
          key: MetricsKeys.WorkflowRunFailedToEnqueue,
          eventId: workspaceId,
        });
      } catch {
        // Metrics may fail if Redis is shutting down — safe to ignore
      }

      this.logger.error(
        `Failed to enqueue workflow runs for workspace: ${workspaceId}`,
        error,
      );
    } finally {
      try {
        await this.workflowThrottlingWorkspaceService.releaseWorkflowEnqueueLock(
          workspaceId,
        );
      } catch (releaseError) {
        this.logger.warn(
          `Failed to release workflow enqueue lock for workspace: ${workspaceId}`,
          releaseError,
        );
      }
    }
  }
}
