import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MoreThanOrEqual, Not, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { PlanLimitKey } from 'src/engine/core-modules/plan-tier/constants/module-catalog.constant';
import { PlanLimitUsageDTO } from 'src/engine/core-modules/plan-tier/dtos/plan-limit-usage.dto';
import { PlanLimitService } from 'src/engine/core-modules/plan-tier/services/plan-limit.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { WhatsappAgentMessageEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent-message.entity';
import { WhatsappAgentEntity } from 'src/engine/metadata-modules/whatsapp-agent/entities/whatsapp-agent.entity';
import { WhatsappAgentMessageDirection } from 'src/engine/metadata-modules/whatsapp-agent/types/whatsapp-agent-message-direction.enum';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

const startOfCurrentMonth = (): Date => {
  const date = new Date();

  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
};

// Pure reporting aggregator for the usage dashboard — reads from every
// domain that owns a plan limit (see module-catalog.constant.ts). This is
// deliberately NOT how enforcement works (PlanLimitService.assertWithinLimit
// stays caller-counts, service-only-resolves, to avoid a god-service
// dependency graph on the hot write path) — a read-only, once-per-settings-
// page-visit aggregator doesn't carry that same risk, so it's fine for it
// to depend on every domain directly.
@Injectable()
export class WorkspacePlanUsageService {
  constructor(
    private readonly planLimitService: PlanLimitService,
    private readonly applicationService: ApplicationService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(WhatsappAgentEntity)
    private readonly whatsappAgentRepository: Repository<WhatsappAgentEntity>,
    @InjectRepository(WhatsappAgentMessageEntity)
    private readonly whatsappAgentMessageRepository: Repository<WhatsappAgentMessageEntity>,
    @InjectRepository(VoiceAgentEntity)
    private readonly voiceAgentRepository: Repository<VoiceAgentEntity>,
    @InjectRepository(VoiceCallEntity)
    private readonly voiceCallRepository: Repository<VoiceCallEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
  ) {}

  async getUsageSnapshot(workspaceId: string): Promise<PlanLimitUsageDTO[]> {
    const used = await this.countAllUsage(workspaceId);

    return Promise.all(
      (
        Object.keys(used) as Exclude<PlanLimitKey, 'apiRateLimitPerMinute'>[]
      ).map(async (key) => ({
        key,
        used: used[key],
        limit: await this.planLimitService.resolveLimit(workspaceId, key),
      })),
    );
  }

  private async countAllUsage(
    workspaceId: string,
  ): Promise<Record<Exclude<PlanLimitKey, 'apiRateLimitPerMinute'>, number>> {
    const startOfMonth = startOfCurrentMonth();

    const { zyraStandardFlatApplication } =
      await this.applicationService.findWorkspaceZyraStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const [
      maxUsers,
      maxContacts,
      maxCompanies,
      maxDashboards,
      maxCustomObjects,
      maxCustomFields,
      maxWhatsAppNumbers,
      maxAIAgents,
      maxAIMessagesMonthly,
      maxVoiceAgents,
      maxVoiceMinutesMonthly,
      maxWorkflowsActive,
      maxWorkflowExecutionsMonthly,
    ] = await Promise.all([
      this.userWorkspaceRepository.count({ where: { workspaceId } }),
      this.countWorkspaceEntityRecords<PersonWorkspaceEntity>(
        workspaceId,
        'person',
      ),
      this.countWorkspaceEntityRecords<CompanyWorkspaceEntity>(
        workspaceId,
        'company',
      ),
      this.pageLayoutRepository.count({
        where: { workspaceId, type: PageLayoutType.DASHBOARD },
      }),
      this.objectMetadataRepository.count({
        where: {
          workspaceId,
          applicationId: Not(zyraStandardFlatApplication.id),
        },
      }),
      this.fieldMetadataRepository.count({
        where: {
          workspaceId,
          applicationId: Not(zyraStandardFlatApplication.id),
        },
      }),
      this.whatsappChannelRepository.count({ where: { workspaceId } }),
      this.whatsappAgentRepository.count({ where: { workspaceId } }),
      this.whatsappAgentMessageRepository.count({
        where: {
          workspaceId,
          direction: WhatsappAgentMessageDirection.OUTBOUND,
          // createdAt is a real Date column on this entity (confirmed in
          // whatsapp-agent-responder.service.ts) — unlike the per-workspace
          // standard-object repositories below, which compare ISO strings.
          createdAt: MoreThanOrEqual(startOfMonth),
        },
      }),
      this.voiceAgentRepository.count({ where: { workspaceId } }),
      this.sumVoiceMinutesThisMonth(workspaceId, startOfMonth),
      this.countActiveWorkflows(workspaceId),
      this.countWorkflowRunsThisMonth(workspaceId, startOfMonth),
    ]);

    return {
      maxUsers,
      maxContacts,
      maxCompanies,
      maxDashboards,
      maxCustomObjects,
      maxCustomFields,
      maxWhatsAppNumbers,
      maxAIAgents,
      maxAIMessagesMonthly,
      maxVoiceAgents,
      maxVoiceMinutesMonthly,
      maxWorkflowsActive,
      maxWorkflowExecutionsMonthly,
    };
  }

  private async countWorkspaceEntityRecords<T extends object>(
    workspaceId: string,
    standardObjectNameSingular: string,
  ): Promise<number> {
    const repository = await this.globalWorkspaceOrmManager.getRepository<T>(
      workspaceId,
      standardObjectNameSingular,
      { shouldBypassPermissionChecks: true },
    );

    return repository.count();
  }

  private async countActiveWorkflows(workspaceId: string): Promise<number> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const activeVersions = await repository.find({
      where: { status: WorkflowVersionStatus.ACTIVE },
      select: ['workflowId'],
    });

    return new Set(activeVersions.map((version) => version.workflowId)).size;
  }

  private async countWorkflowRunsThisMonth(
    workspaceId: string,
    startOfMonth: Date,
  ): Promise<number> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    // Standard-object repositories compare Date columns as ISO strings —
    // see the identical choice (and the reason for it) in
    // workflow-run-enqueue.workspace-service.ts.
    return repository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth.toISOString()),
      },
    });
  }

  private async sumVoiceMinutesThisMonth(
    workspaceId: string,
    startOfMonth: Date,
  ): Promise<number> {
    const { sum } = (await this.voiceCallRepository
      .createQueryBuilder('voiceCall')
      .select('SUM(voiceCall.durationSeconds)', 'sum')
      .where('voiceCall.workspaceId = :workspaceId', { workspaceId })
      .andWhere('voiceCall.createdAt >= :startOfMonth', { startOfMonth })
      .getRawOne()) ?? { sum: 0 };

    return Math.floor(Number(sum ?? 0) / 60);
  }
}
