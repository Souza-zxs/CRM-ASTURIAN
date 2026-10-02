# Workshop WhatsApp Automations (Part A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A guided Settings screen where a workspace turns on/off and picks WhatsApp templates for: workshop signup confirmation, a reminders group (day-before/1h-before/at-start), post-workshop follow-up (attended, didn't buy), and recovery (no-show) — all scheduled automatically off `Opportunity.workshopSessionScheduledAt`, with no manual workflow-building required.

**Architecture:** A shared `WhatsappTemplateSenderService` (extracted from the existing `SendWhatsappTemplateWorkflowAction`) does the actual template lookup/validation/send. A new `WorkshopAutomationSettingsEntity` holds one row of toggles+template-ids per workspace. `WorkshopAutomationSchedulerService.scheduleForOpportunity(...)`, called from `FunnelLeadCrmSyncService.createOpportunity()`, enqueues one BullMQ delayed job per enabled automation onto the existing `delayedJobsQueue`. A single job processor re-checks the settings row and the opportunity's current stage at fire time before sending, so a toggle flipped off (or a lead that already bought / never showed up) is honored even for jobs scheduled earlier.

**Tech Stack:** NestJS, TypeORM (core schema), BullMQ (via the existing `MessageQueueService`/`@Processor`/`@Process` wrapper), GraphQL (code-first), React, Lingui.

**Depends on:** this plan assumes `docs/superpowers/plans/2026-10-01-plan-tier-gating.md` is implemented first — the settings page this plan builds is gated by `PlanFeatureGuard(PlanGatedFeature.WHATSAPP)` from that plan (Task 9 below). If that plan hasn't landed yet, skip the gating line in Task 9's resolver and revisit it once it has.

## Global Constraints

- Only named exports, functional components, types (not interfaces) except extending third-party interfaces, no `any`, no abbreviations in variable names (per CLAUDE.md).
- New entity tables are created via **instance commands**, never hand-written TypeORM migrations.
- Run `npx nx lint:diff-with-main zyra-server` / `asturian-front` and `npx nx typecheck zyra-server` (and `oxlint --type-aware` for asturian-front — full typecheck OOMs on that package per project memory) after each task touching that package.
- After any GraphQL schema change, run `npx nx run asturian-front:graphql:generate` before writing frontend code that consumes it.
- Commit after every task.
- Automation offsets from `sessionScheduledAt` are hardcoded, not user-configurable: confirmation = `0` (send immediately on signup), reminders = `-24h` / `-1h` / `0`, recovery = `+4h`, follow-up = `+24h`.
- LGPD: never log a lead's phone number or email (matches the existing convention in `FunnelLeadCrmSyncService` and `SendWhatsappTemplateWorkflowAction` — log template names, workspace ids, and opportunity ids only).

---

### Task 1: Extract `WhatsappTemplateSenderService`

**Files:**
- Create: `packages/zyra-server/src/engine/metadata-modules/whatsapp-template/services/whatsapp-template-sender.service.ts`
- Modify: `packages/zyra-server/src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/send-whatsapp-template.workflow-action.ts`
- Modify: `packages/zyra-server/src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/send-whatsapp-template-action.module.ts` (wire the new service in instead of the 5 raw repositories, if it doesn't already import a module that provides them)
- Modify: `packages/zyra-server/src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/__tests__/send-whatsapp-template.workflow-action.spec.ts`
- Test: `packages/zyra-server/src/engine/metadata-modules/whatsapp-template/services/__tests__/whatsapp-template-sender.service.spec.ts`

**Interfaces:**
- Produces: `WhatsappTemplateSenderService.sendByTemplateId({ workspaceId: string, whatsappTemplateId: string, to: string, bodyParameters?: string[] }): Promise<{ messageExternalId: string } | { error: string }>` — same success/error-as-value contract the workflow action already has (never throws for a rejected send; still throws `WorkflowStepExecutorException`-style errors for "template not found" / "not approved" / "channel not connected" / "no recipient digits", exactly matching today's behavior, since those are precondition failures, not send failures).

- [ ] **Step 1: Write the failing test for the new service**

This test is the existing `send-whatsapp-template.workflow-action.spec.ts` file's test bodies, moved onto the new service and re-targeted at its new public method (the behavior under test doesn't change, only which class owns it):

```ts
// packages/zyra-server/src/engine/metadata-modules/whatsapp-template/services/__tests__/whatsapp-template-sender.service.spec.ts
import { WhatsappTemplateStatus } from 'zyra-shared/types';

import { WhatsappTemplateSenderService } from 'src/engine/metadata-modules/whatsapp-template/services/whatsapp-template-sender.service';

const WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';

describe('WhatsappTemplateSenderService', () => {
  const whatsappTemplateRepository = { findOne: jest.fn() };
  const whatsappChannelRepository = { findOne: jest.fn() };
  const connectedAccountRepository = { findOne: jest.fn() };
  const tokenEncryptionService = { decrypt: jest.fn() };
  const whatsappGraphApiService = { sendTemplateMessage: jest.fn() };

  const buildService = () =>
    new WhatsappTemplateSenderService(
      whatsappTemplateRepository as never,
      whatsappChannelRepository as never,
      connectedAccountRepository as never,
      tokenEncryptionService as never,
      whatsappGraphApiService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    whatsappTemplateRepository.findOne.mockResolvedValue({
      id: 'template-1',
      name: 'lembrete_workshop',
      language: 'pt_BR',
      status: WhatsappTemplateStatus.APPROVED,
      whatsappChannelId: 'channel-1',
    });
    whatsappChannelRepository.findOne.mockResolvedValue({
      id: 'channel-1',
      phoneNumberId: 'phone-number-id',
      connectedAccountId: 'account-1',
    });
    connectedAccountRepository.findOne.mockResolvedValue({
      id: 'account-1',
      accessToken: 'ciphertext',
    });
    tokenEncryptionService.decrypt.mockReturnValue('plain-token');
    whatsappGraphApiService.sendTemplateMessage.mockResolvedValue({
      messageExternalId: 'wamid.1',
    });
  });

  it('sends the approved template to the normalized recipient', async () => {
    const output = await buildService().sendByTemplateId({
      workspaceId: WORKSPACE_ID,
      whatsappTemplateId: 'template-1',
      to: '(83) 99999-9999',
      bodyParameters: ['Maria'],
    });

    expect(output).toEqual({ messageExternalId: 'wamid.1' });
    expect(whatsappGraphApiService.sendTemplateMessage).toHaveBeenCalledWith(
      'phone-number-id',
      'plain-token',
      '5583999999999',
      'lembrete_workshop',
      'pt_BR',
      ['Maria'],
    );
  });

  it('looks the template up scoped to the given workspace', async () => {
    await buildService().sendByTemplateId({
      workspaceId: WORKSPACE_ID,
      whatsappTemplateId: 'template-1',
      to: '83999999999',
    });

    expect(whatsappTemplateRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'template-1', workspaceId: WORKSPACE_ID },
    });
  });

  it('throws when the template is not approved yet', async () => {
    whatsappTemplateRepository.findOne.mockResolvedValue({
      id: 'template-1',
      name: 'lembrete_workshop',
      language: 'pt_BR',
      status: WhatsappTemplateStatus.PENDING,
      whatsappChannelId: 'channel-1',
    });

    await expect(
      buildService().sendByTemplateId({
        workspaceId: WORKSPACE_ID,
        whatsappTemplateId: 'template-1',
        to: '83999999999',
      }),
    ).rejects.toThrow('not approved yet');
  });

  it('throws when the template does not exist in the workspace', async () => {
    whatsappTemplateRepository.findOne.mockResolvedValue(null);

    await expect(
      buildService().sendByTemplateId({
        workspaceId: WORKSPACE_ID,
        whatsappTemplateId: 'template-1',
        to: '83999999999',
      }),
    ).rejects.toThrow('WhatsApp template not found');
  });

  it('throws when the recipient has no digits', async () => {
    await expect(
      buildService().sendByTemplateId({
        workspaceId: WORKSPACE_ID,
        whatsappTemplateId: 'template-1',
        to: 'sem numero',
      }),
    ).rejects.toThrow('recipient phone number is required');
  });

  it('returns the Graph API failure as a value instead of throwing', async () => {
    whatsappGraphApiService.sendTemplateMessage.mockRejectedValue(
      new Error('Meta rejected the message'),
    );

    const output = await buildService().sendByTemplateId({
      workspaceId: WORKSPACE_ID,
      whatsappTemplateId: 'template-1',
      to: '83999999999',
    });

    expect(output).toEqual({ error: 'Meta rejected the message' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest whatsapp-template-sender.service.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the service by moving the existing logic**

```ts
// packages/zyra-server/src/engine/metadata-modules/whatsapp-template/services/whatsapp-template-sender.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WhatsappTemplateStatus } from 'zyra-shared/types';
import { isDefined } from 'zyra-shared/utils';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { WhatsappTemplateEntity } from 'src/engine/metadata-modules/whatsapp-template/entities/whatsapp-template.entity';
import { WhatsappGraphApiService } from 'src/modules/whatsapp/services/whatsapp-graph-api.service';
import { normalizeWhatsappRecipient } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/utils/normalize-whatsapp-recipient.util';

export class WhatsappTemplateSenderException extends Error {}

export type SendByTemplateIdInput = {
  workspaceId: string;
  whatsappTemplateId: string;
  to: string;
  bodyParameters?: string[];
};

export type SendByTemplateIdOutput =
  | { messageExternalId: string }
  | { error: string };

@Injectable()
export class WhatsappTemplateSenderService {
  constructor(
    @InjectRepository(WhatsappTemplateEntity)
    private readonly whatsappTemplateRepository: Repository<WhatsappTemplateEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly whatsappGraphApiService: WhatsappGraphApiService,
  ) {}

  async sendByTemplateId({
    workspaceId,
    whatsappTemplateId,
    to,
    bodyParameters,
  }: SendByTemplateIdInput): Promise<SendByTemplateIdOutput> {
    const recipient = normalizeWhatsappRecipient(to ?? '');

    if (recipient.length === 0) {
      throw new WhatsappTemplateSenderException(
        'A recipient phone number is required to send a WhatsApp template',
      );
    }

    const whatsappTemplate = await this.whatsappTemplateRepository.findOne({
      where: { id: whatsappTemplateId, workspaceId },
    });

    if (!isDefined(whatsappTemplate)) {
      throw new WhatsappTemplateSenderException('WhatsApp template not found');
    }

    if (whatsappTemplate.status !== WhatsappTemplateStatus.APPROVED) {
      throw new WhatsappTemplateSenderException(
        `WhatsApp template "${whatsappTemplate.name}" is not approved yet (status: ${whatsappTemplate.status})`,
      );
    }

    const whatsappChannel = await this.whatsappChannelRepository.findOne({
      where: { id: whatsappTemplate.whatsappChannelId, workspaceId },
    });

    const connectedAccount = isDefined(whatsappChannel)
      ? await this.connectedAccountRepository.findOne({
          where: { id: whatsappChannel.connectedAccountId, workspaceId },
        })
      : null;

    if (
      !isDefined(whatsappChannel) ||
      !isDefined(connectedAccount) ||
      !isDefined(connectedAccount.accessToken)
    ) {
      throw new WhatsappTemplateSenderException(
        'The WhatsApp channel of this template is not connected',
      );
    }

    const accessToken = this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId,
    });

    try {
      const { messageExternalId } =
        await this.whatsappGraphApiService.sendTemplateMessage(
          whatsappChannel.phoneNumberId,
          accessToken,
          recipient,
          whatsappTemplate.name,
          whatsappTemplate.language,
          bodyParameters ?? [],
        );

      return { messageExternalId };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

- [ ] **Step 4: Run the new service test to verify it passes**

Run: `cd packages/zyra-server && npx jest whatsapp-template-sender.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Refactor the workflow action to call the new service**

```ts
// send-whatsapp-template.workflow-action.ts — replace the 5-repository
// constructor and inline logic with:
import { Injectable, Logger } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { WhatsappTemplateSenderService } from 'src/engine/metadata-modules/whatsapp-template/services/whatsapp-template-sender.service';
import { WorkflowStepExecutorException, WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendWhatsappTemplateAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/guards/is-workflow-send-whatsapp-template-action.guard';
import { type WorkflowSendWhatsappTemplateActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template/types/workflow-send-whatsapp-template-action-input.type';
import { resolveInput } from 'zyra-shared/utils';

@Injectable()
export class SendWhatsappTemplateWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(SendWhatsappTemplateWorkflowAction.name);

  constructor(
    private readonly whatsappTemplateSenderService: WhatsappTemplateSenderService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowSendWhatsappTemplateAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send WhatsApp template action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const input = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowSendWhatsappTemplateActionInput;
    const { workspaceId } = runInfo;

    try {
      const result = await this.whatsappTemplateSenderService.sendByTemplateId({
        workspaceId,
        whatsappTemplateId: input.whatsappTemplateId,
        to: input.to ?? '',
        bodyParameters: input.bodyParameters,
      });

      if ('error' in result) {
        this.logger.error(
          `Failed to send WhatsApp template in workspace ${workspaceId}: ${result.error}`,
        );

        return { error: result.error };
      }

      return { result };
    } catch (error) {
      throw new WorkflowStepExecutorException(
        error instanceof Error ? error.message : String(error),
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }
  }
}
```

Keep whatever the real `WorkflowStepExecutorExceptionCode` member name is (confirm by reading the exceptions file) — this plan uses `INVALID_STEP_INPUT` for every precondition failure, collapsing the three distinct codes the original inline version used, since the new shared service no longer distinguishes them by throw site. If losing that distinction matters (check whether any test or caller asserts on the specific code, not just the message), instead catch `WhatsappTemplateSenderException` and re-throw with the original three codes based on matching the error message — read `workflow-step-executor.exception.ts` and the original code before deciding, and prefer preserving existing behavior over the simplification shown here.

- [ ] **Step 6: Update the existing workflow-action test file**

Replace its 5-repository mocks with a single `whatsappTemplateSenderService` mock (`{ sendByTemplateId: jest.fn() }`), update the `execute` helper to construct `SendWhatsappTemplateWorkflowAction` with just that one dependency, and change each test's arrange step to mock `sendByTemplateId`'s resolved/rejected value directly instead of mocking the 5 repositories — same test names, same assertions on the action's output, different mocking target. This is a refactor of the test's internals to match the new constructor, not a behavior change; every `it(...)` description should stay the same.

- [ ] **Step 7: Update the action's module wiring**

Read `send-whatsapp-template-action.module.ts` and whatever module currently provides the 5 repositories to this action; add an import of a module that exports `WhatsappTemplateSenderService` (create a small `WhatsappTemplateModule` under `engine/metadata-modules/whatsapp-template/` if one doesn't already exist providing the template/channel/connected-account repositories + token encryption + graph api service — check first, these entities likely already have a owning module to extend rather than duplicate).

- [ ] **Step 8: Run both test files**

Run: `cd packages/zyra-server && npx jest whatsapp-template-sender.service.spec.ts send-whatsapp-template.workflow-action.spec.ts`
Expected: PASS (same count of passing tests as before the refactor — 6 in the sender service, 6 in the action, both verifying the same behaviors from two different layers now)

- [ ] **Step 9: Typecheck and lint**

Run: `npx nx typecheck zyra-server` then `npx nx lint:diff-with-main zyra-server`

- [ ] **Step 10: Commit**

```bash
git add packages/zyra-server/src/engine/metadata-modules/whatsapp-template packages/zyra-server/src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp-template
git commit -m "refactor(server): extrai WhatsappTemplateSenderService da action de workflow"
```

---

### Task 2: `WorkshopAutomationSettingsEntity` + fast instance command

**Files:**
- Create: `packages/zyra-server/src/modules/workshop-automation/entities/workshop-automation-settings.entity.ts`
- Create (generated): fast instance command under `packages/zyra-server/src/database/commands/instance-commands/`
- Test: `packages/zyra-server/src/modules/workshop-automation/entities/__tests__/workshop-automation-settings.entity.spec.ts`

**Interfaces:**
- Produces: `WorkshopAutomationSettingsEntity` with `id`, `workspaceId` (unique), `signupConfirmationEnabled: boolean` (default `false`), `signupConfirmationTemplateId: string | null`, `remindersEnabled: boolean` (default `false`), `reminderDayBeforeTemplateId: string | null`, `reminderOneHourBeforeTemplateId: string | null`, `reminderAtStartTemplateId: string | null`, `followUpEnabled: boolean` (default `false`), `followUpTemplateId: string | null`, `recoveryEnabled: boolean` (default `false`), `recoveryTemplateId: string | null`, `createdAt`, `updatedAt`.

- [ ] **Step 1: Write the entity**

```ts
// packages/zyra-server/src/modules/workshop-automation/entities/workshop-automation-settings.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'workshopAutomationSettings', schema: 'core' })
@Unique('IDX_WORKSHOP_AUTOMATION_SETTINGS_WORKSPACE_ID_UNIQUE', ['workspaceId'])
export class WorkshopAutomationSettingsEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: false })
  signupConfirmationEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  signupConfirmationTemplateId: string | null;

  @Column({ nullable: false, default: false })
  remindersEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  reminderDayBeforeTemplateId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  reminderOneHourBeforeTemplateId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  reminderAtStartTemplateId: string | null;

  @Column({ nullable: false, default: false })
  followUpEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  followUpTemplateId: string | null;

  @Column({ nullable: false, default: false })
  recoveryEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  recoveryTemplateId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Generate and implement the fast instance command**

Run: `npx nx run zyra-server:database:migrate:generate --name create-workshop-automation-settings-table --type fast`

```ts
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE "core"."workshopAutomationSettings" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "workspaceId" uuid NOT NULL,
      "signupConfirmationEnabled" boolean NOT NULL DEFAULT false,
      "signupConfirmationTemplateId" uuid,
      "remindersEnabled" boolean NOT NULL DEFAULT false,
      "reminderDayBeforeTemplateId" uuid,
      "reminderOneHourBeforeTemplateId" uuid,
      "reminderAtStartTemplateId" uuid,
      "followUpEnabled" boolean NOT NULL DEFAULT false,
      "followUpTemplateId" uuid,
      "recoveryEnabled" boolean NOT NULL DEFAULT false,
      "recoveryTemplateId" uuid,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_WORKSHOP_AUTOMATION_SETTINGS" PRIMARY KEY ("id"),
      CONSTRAINT "IDX_WORKSHOP_AUTOMATION_SETTINGS_WORKSPACE_ID_UNIQUE" UNIQUE ("workspaceId")
    )
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE "core"."workshopAutomationSettings"`);
}
```

- [ ] **Step 3: Apply the migration locally**

Run: `npx nx run zyra-server:database:migrate`
Expected: succeeds; confirm the table via the read-only Postgres MCP inspector.

- [ ] **Step 4: Write a smoke test for the entity shape**

```ts
// packages/zyra-server/src/modules/workshop-automation/entities/__tests__/workshop-automation-settings.entity.spec.ts
import { getMetadataArgsStorage } from 'typeorm';

import { WorkshopAutomationSettingsEntity } from 'src/modules/workshop-automation/entities/workshop-automation-settings.entity';

describe('WorkshopAutomationSettingsEntity', () => {
  it('is registered under the core schema with the expected table name', () => {
    const table = getMetadataArgsStorage().tables.find(
      (entry) => entry.target === WorkshopAutomationSettingsEntity,
    );

    expect(table?.name).toBe('workshopAutomationSettings');
    expect(table?.schema).toBe('core');
  });
});
```

- [ ] **Step 5: Run the test**

Run: `cd packages/zyra-server && npx jest workshop-automation-settings.entity.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/zyra-server/src/modules/workshop-automation packages/zyra-server/src/database/commands
git commit -m "feat(server): entidade e tabela de configuracoes de automacao do workshop"
```

---

### Task 3: `WorkshopAutomationSchedulerService`

**Files:**
- Create: `packages/zyra-server/src/modules/workshop-automation/types/workshop-automation-kind.enum.ts`
- Create: `packages/zyra-server/src/modules/workshop-automation/services/workshop-automation-scheduler.service.ts`
- Create: `packages/zyra-server/src/modules/workshop-automation/constants/workshop-automation-job-name.constant.ts`
- Test: `packages/zyra-server/src/modules/workshop-automation/services/__tests__/workshop-automation-scheduler.service.spec.ts`

**Interfaces:**
- Produces: `WorkshopAutomationKind` enum (`SIGNUP_CONFIRMATION | REMINDER_DAY_BEFORE | REMINDER_ONE_HOUR_BEFORE | REMINDER_AT_START | FOLLOW_UP | RECOVERY`). `WorkshopAutomationSchedulerService.scheduleForOpportunity({ workspaceId: string, opportunityId: string, sessionScheduledAt: Date }): Promise<void>`. `WORKSHOP_AUTOMATION_JOB_NAME: string` constant and `WorkshopAutomationJobData = { workspaceId: string, opportunityId: string, kind: WorkshopAutomationKind }` type (used by Task 4's job processor).
- Consumes: `WorkshopAutomationSettingsEntity` repository (Task 2), `MessageQueueService` + `MessageQueue.delayedJobsQueue` (existing, confirmed in research via `resume-delayed-workflow.job.ts`).

- [ ] **Step 1: Write the enum, job-name constant, and job-data type**

```ts
// packages/zyra-server/src/modules/workshop-automation/types/workshop-automation-kind.enum.ts
export enum WorkshopAutomationKind {
  SIGNUP_CONFIRMATION = 'SIGNUP_CONFIRMATION',
  REMINDER_DAY_BEFORE = 'REMINDER_DAY_BEFORE',
  REMINDER_ONE_HOUR_BEFORE = 'REMINDER_ONE_HOUR_BEFORE',
  REMINDER_AT_START = 'REMINDER_AT_START',
  FOLLOW_UP = 'FOLLOW_UP',
  RECOVERY = 'RECOVERY',
}
```

```ts
// packages/zyra-server/src/modules/workshop-automation/constants/workshop-automation-job-name.constant.ts
export const WORKSHOP_AUTOMATION_JOB_NAME = 'WorkshopAutomationJob';
```

```ts
// packages/zyra-server/src/modules/workshop-automation/types/workshop-automation-job-data.type.ts
import { WorkshopAutomationKind } from 'src/modules/workshop-automation/types/workshop-automation-kind.enum';

export type WorkshopAutomationJobData = {
  workspaceId: string;
  opportunityId: string;
  kind: WorkshopAutomationKind;
};
```

- [ ] **Step 2: Write the failing test**

```ts
// packages/zyra-server/src/modules/workshop-automation/services/__tests__/workshop-automation-scheduler.service.spec.ts
import { WorkshopAutomationKind } from 'src/modules/workshop-automation/types/workshop-automation-kind.enum';
import { WORKSHOP_AUTOMATION_JOB_NAME } from 'src/modules/workshop-automation/constants/workshop-automation-job-name.constant';
import { WorkshopAutomationSchedulerService } from 'src/modules/workshop-automation/services/workshop-automation-scheduler.service';

describe('WorkshopAutomationSchedulerService', () => {
  const settingsRepository = { findOne: jest.fn() };
  const messageQueueService = { add: jest.fn() };

  const buildService = () =>
    new WorkshopAutomationSchedulerService(
      settingsRepository as never,
      messageQueueService as never,
    );

  const NOW = new Date('2026-10-01T12:00:00.000Z');
  const SESSION_IN_TWO_DAYS = new Date('2026-10-03T12:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => jest.useRealTimers());

  it('does nothing when the workspace has no settings row', async () => {
    settingsRepository.findOne.mockResolvedValue(null);

    await buildService().scheduleForOpportunity({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      sessionScheduledAt: SESSION_IN_TWO_DAYS,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('schedules only the enabled automations whose fire time is still in the future', async () => {
    settingsRepository.findOne.mockResolvedValue({
      signupConfirmationEnabled: true,
      remindersEnabled: true,
      followUpEnabled: false,
      recoveryEnabled: true,
    });

    await buildService().scheduleForOpportunity({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      sessionScheduledAt: SESSION_IN_TWO_DAYS,
    });

    const scheduledKinds = messageQueueService.add.mock.calls.map(
      (call: unknown[]) => (call[1] as { kind: WorkshopAutomationKind }).kind,
    );

    expect(scheduledKinds).toEqual(
      expect.arrayContaining([
        WorkshopAutomationKind.SIGNUP_CONFIRMATION,
        WorkshopAutomationKind.REMINDER_DAY_BEFORE,
        WorkshopAutomationKind.REMINDER_ONE_HOUR_BEFORE,
        WorkshopAutomationKind.REMINDER_AT_START,
        WorkshopAutomationKind.RECOVERY,
      ]),
    );
    expect(scheduledKinds).not.toContain(WorkshopAutomationKind.FOLLOW_UP);
    expect(messageQueueService.add).toHaveBeenCalledWith(
      WORKSHOP_AUTOMATION_JOB_NAME,
      {
        workspaceId: 'workspace-1',
        opportunityId: 'opportunity-1',
        kind: WorkshopAutomationKind.RECOVERY,
      },
      { delay: 4 * 60 * 60 * 1000 },
    );
  });

  it('skips a reminder whose fire time has already passed', async () => {
    settingsRepository.findOne.mockResolvedValue({
      signupConfirmationEnabled: false,
      remindersEnabled: true,
      followUpEnabled: false,
      recoveryEnabled: false,
    });

    // Session starts in 30 minutes: the day-before and 1h-before reminders
    // would fire in the past, only the at-start one is still pending.
    await buildService().scheduleForOpportunity({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      sessionScheduledAt: new Date(NOW.getTime() + 30 * 60 * 1000),
    });

    const scheduledKinds = messageQueueService.add.mock.calls.map(
      (call: unknown[]) => (call[1] as { kind: WorkshopAutomationKind }).kind,
    );

    expect(scheduledKinds).toEqual([WorkshopAutomationKind.REMINDER_AT_START]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest workshop-automation-scheduler.service.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write the implementation**

```ts
// packages/zyra-server/src/modules/workshop-automation/services/workshop-automation-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WORKSHOP_AUTOMATION_JOB_NAME } from 'src/modules/workshop-automation/constants/workshop-automation-job-name.constant';
import { WorkshopAutomationSettingsEntity } from 'src/modules/workshop-automation/entities/workshop-automation-settings.entity';
import { WorkshopAutomationKind } from 'src/modules/workshop-automation/types/workshop-automation-kind.enum';
import { type WorkshopAutomationJobData } from 'src/modules/workshop-automation/types/workshop-automation-job-data.type';

const HOUR_MS = 60 * 60 * 1000;

// Offset from sessionScheduledAt, in milliseconds. Negative = before the
// session, positive = after. Hardcoded by design (see plan's Global
// Constraints) — not user-configurable in this iteration.
const OFFSET_MS_BY_KIND: Record<WorkshopAutomationKind, number> = {
  [WorkshopAutomationKind.SIGNUP_CONFIRMATION]: 0,
  [WorkshopAutomationKind.REMINDER_DAY_BEFORE]: -24 * HOUR_MS,
  [WorkshopAutomationKind.REMINDER_ONE_HOUR_BEFORE]: -1 * HOUR_MS,
  [WorkshopAutomationKind.REMINDER_AT_START]: 0,
  [WorkshopAutomationKind.FOLLOW_UP]: 24 * HOUR_MS,
  [WorkshopAutomationKind.RECOVERY]: 4 * HOUR_MS,
};

type SettingsRow = Pick<
  WorkshopAutomationSettingsEntity,
  | 'signupConfirmationEnabled'
  | 'remindersEnabled'
  | 'followUpEnabled'
  | 'recoveryEnabled'
>;

const isKindEnabled = (kind: WorkshopAutomationKind, settings: SettingsRow): boolean => {
  switch (kind) {
    case WorkshopAutomationKind.SIGNUP_CONFIRMATION:
      return settings.signupConfirmationEnabled;
    case WorkshopAutomationKind.REMINDER_DAY_BEFORE:
    case WorkshopAutomationKind.REMINDER_ONE_HOUR_BEFORE:
    case WorkshopAutomationKind.REMINDER_AT_START:
      return settings.remindersEnabled;
    case WorkshopAutomationKind.FOLLOW_UP:
      return settings.followUpEnabled;
    case WorkshopAutomationKind.RECOVERY:
      return settings.recoveryEnabled;
  }
};

@Injectable()
export class WorkshopAutomationSchedulerService {
  constructor(
    @InjectRepository(WorkshopAutomationSettingsEntity)
    private readonly settingsRepository: Repository<WorkshopAutomationSettingsEntity>,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async scheduleForOpportunity({
    workspaceId,
    opportunityId,
    sessionScheduledAt,
  }: {
    workspaceId: string;
    opportunityId: string;
    sessionScheduledAt: Date;
  }): Promise<void> {
    const settings = await this.settingsRepository.findOne({
      where: { workspaceId },
    });

    if (!isDefined(settings)) {
      return;
    }

    const now = Date.now();

    for (const kind of Object.values(WorkshopAutomationKind)) {
      if (!isKindEnabled(kind, settings)) {
        continue;
      }

      const fireAt = sessionScheduledAt.getTime() + OFFSET_MS_BY_KIND[kind];
      const delay = fireAt - now;

      if (delay <= 0) {
        continue;
      }

      await this.messageQueueService.add<WorkshopAutomationJobData>(
        WORKSHOP_AUTOMATION_JOB_NAME,
        { workspaceId, opportunityId, kind },
        { delay },
      );
    }
  }
}
```

Confirm `InjectMessageQueue` + `MessageQueueService.add`'s exact generic/options signature by re-reading `resume-delayed-workflow.job.ts`'s usage (`messageQueueService.add<RunWorkflowJobData>(RunWorkflowJob.name, data)`) and `message-queue.service.ts` directly — the `{ delay }` options object is assumed here by analogy with standard BullMQ `add(name, data, opts)`; verify `MessageQueueService.add`'s real parameter list accepts a third options argument before finalizing, and adjust if it doesn't (e.g. if delay must be passed inside the data payload instead).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/zyra-server && npx jest workshop-automation-scheduler.service.spec.ts`
Expected: PASS (all 3 cases)

- [ ] **Step 6: Lint and typecheck**

Run: `npx nx lint:diff-with-main zyra-server` then `npx nx typecheck zyra-server`

- [ ] **Step 7: Commit**

```bash
git add packages/zyra-server/src/modules/workshop-automation
git commit -m "feat(server): WorkshopAutomationSchedulerService"
```

---

### Task 4: `WorkshopAutomationJob` processor

**Files:**
- Create: `packages/zyra-server/src/modules/workshop-automation/jobs/workshop-automation.job.ts`
- Test: `packages/zyra-server/src/modules/workshop-automation/jobs/__tests__/workshop-automation.job.spec.ts`

**Interfaces:**
- Consumes: `WhatsappTemplateSenderService.sendByTemplateId` (Task 1), `WorkshopAutomationSettingsEntity` repository (Task 2), `FindRecordsService` (existing, used exactly as `FunnelLeadCrmSyncService` already uses it for `objectName: 'opportunity'`), `WorkshopAutomationJobData` (Task 3).
- Produces: `WorkshopAutomationJob` — a `@Processor({ queueName: MessageQueue.delayedJobsQueue })` class with one `@Process(WORKSHOP_AUTOMATION_JOB_NAME)` handler.

- [ ] **Step 1: Write the failing test**

```ts
// packages/zyra-server/src/modules/workshop-automation/jobs/__tests__/workshop-automation.job.spec.ts
import { WorkshopAutomationKind } from 'src/modules/workshop-automation/types/workshop-automation-kind.enum';
import { WorkshopAutomationJob } from 'src/modules/workshop-automation/jobs/workshop-automation.job';

describe('WorkshopAutomationJob', () => {
  const settingsRepository = { findOne: jest.fn() };
  const findRecordsService = { execute: jest.fn() };
  const whatsappTemplateSenderService = { sendByTemplateId: jest.fn() };
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) => callback()),
  };

  const buildJob = () =>
    new WorkshopAutomationJob(
      settingsRepository as never,
      findRecordsService as never,
      whatsappTemplateSenderService as never,
      globalWorkspaceOrmManager as never,
    );

  beforeEach(() => jest.clearAllMocks());

  it('sends the follow-up when the opportunity attended but is still in MEETING', async () => {
    settingsRepository.findOne.mockResolvedValue({
      followUpEnabled: true,
      followUpTemplateId: 'template-1',
    });
    findRecordsService.execute.mockResolvedValue({
      result: {
        records: [{ id: 'opportunity-1', stage: 'MEETING', pointOfContactId: 'person-1' }],
      },
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.FOLLOW_UP,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-1',
        whatsappTemplateId: 'template-1',
      }),
    );
  });

  it('skips the follow-up once the opportunity already reached CUSTOMER', async () => {
    settingsRepository.findOne.mockResolvedValue({
      followUpEnabled: true,
      followUpTemplateId: 'template-1',
    });
    findRecordsService.execute.mockResolvedValue({
      result: {
        records: [{ id: 'opportunity-1', stage: 'CUSTOMER', pointOfContactId: 'person-1' }],
      },
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.FOLLOW_UP,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).not.toHaveBeenCalled();
  });

  it('sends recovery only if the opportunity never left NEW (no-show)', async () => {
    settingsRepository.findOne.mockResolvedValue({
      recoveryEnabled: true,
      recoveryTemplateId: 'template-2',
    });
    findRecordsService.execute.mockResolvedValue({
      result: {
        records: [{ id: 'opportunity-1', stage: 'NEW', pointOfContactId: 'person-1' }],
      },
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.RECOVERY,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).toHaveBeenCalledWith(
      expect.objectContaining({ whatsappTemplateId: 'template-2' }),
    );
  });

  it('skips recovery once the opportunity attended (left NEW)', async () => {
    settingsRepository.findOne.mockResolvedValue({
      recoveryEnabled: true,
      recoveryTemplateId: 'template-2',
    });
    findRecordsService.execute.mockResolvedValue({
      result: {
        records: [{ id: 'opportunity-1', stage: 'MEETING', pointOfContactId: 'person-1' }],
      },
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.RECOVERY,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).not.toHaveBeenCalled();
  });

  it('skips silently when the toggle was switched off after scheduling', async () => {
    settingsRepository.findOne.mockResolvedValue({
      recoveryEnabled: false,
      recoveryTemplateId: 'template-2',
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.RECOVERY,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).not.toHaveBeenCalled();
    expect(findRecordsService.execute).not.toHaveBeenCalled();
  });

  it('skips silently when no template id is set for the automation', async () => {
    settingsRepository.findOne.mockResolvedValue({
      signupConfirmationEnabled: true,
      signupConfirmationTemplateId: null,
    });

    await buildJob().handle({
      workspaceId: 'workspace-1',
      opportunityId: 'opportunity-1',
      kind: WorkshopAutomationKind.SIGNUP_CONFIRMATION,
    });

    expect(whatsappTemplateSenderService.sendByTemplateId).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest workshop-automation.job.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

```ts
// packages/zyra-server/src/modules/workshop-automation/jobs/workshop-automation.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WhatsappTemplateSenderService } from 'src/engine/metadata-modules/whatsapp-template/services/whatsapp-template-sender.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/zyra-orm/utils/build-system-auth-context.util';
import { WORKSHOP_AUTOMATION_JOB_NAME } from 'src/modules/workshop-automation/constants/workshop-automation-job-name.constant';
import { WorkshopAutomationSettingsEntity } from 'src/modules/workshop-automation/entities/workshop-automation-settings.entity';
import { WorkshopAutomationKind } from 'src/modules/workshop-automation/types/workshop-automation-kind.enum';
import { type WorkshopAutomationJobData } from 'src/modules/workshop-automation/types/workshop-automation-job-data.type';

type RecipientLookup = { templateId: string | null; needsOpportunity: boolean };

@Processor({ queueName: MessageQueue.delayedJobsQueue })
@Injectable()
export class WorkshopAutomationJob {
  private readonly logger = new Logger(WorkshopAutomationJob.name);

  constructor(
    @InjectRepository(WorkshopAutomationSettingsEntity)
    private readonly settingsRepository: Repository<WorkshopAutomationSettingsEntity>,
    private readonly findRecordsService: FindRecordsService,
    private readonly whatsappTemplateSenderService: WhatsappTemplateSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(WORKSHOP_AUTOMATION_JOB_NAME)
  async handle({ workspaceId, opportunityId, kind }: WorkshopAutomationJobData): Promise<void> {
    const settings = await this.settingsRepository.findOne({ where: { workspaceId } });

    if (!isDefined(settings)) {
      return;
    }

    const lookup = this.resolveTemplateId(kind, settings);

    if (!isDefined(lookup.templateId)) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunity = await this.findRecordsService.execute({
        objectName: 'opportunity',
        filter: { id: { eq: opportunityId } },
        limit: 1,
        authContext,
        shouldBuildEffectiveSelectFields: false,
      });

      const record = opportunity.result?.records[0] as
        | { id: string; stage: string; pointOfContactId: string }
        | undefined;

      if (!isDefined(record)) {
        return;
      }

      if (kind === WorkshopAutomationKind.FOLLOW_UP && record.stage !== 'MEETING') {
        return;
      }

      if (kind === WorkshopAutomationKind.RECOVERY && record.stage !== 'NEW') {
        return;
      }

      const person = await this.findRecordsService.execute({
        objectName: 'person',
        filter: { id: { eq: record.pointOfContactId } },
        limit: 1,
        authContext,
        shouldBuildEffectiveSelectFields: false,
      });

      const phone = (
        person.result?.records[0] as { phones?: { primaryPhoneNumber?: string } } | undefined
      )?.phones?.primaryPhoneNumber;

      if (!isDefined(phone)) {
        return;
      }

      const result = await this.whatsappTemplateSenderService.sendByTemplateId({
        workspaceId,
        whatsappTemplateId: lookup.templateId as string,
        to: phone,
      });

      if ('error' in result) {
        this.logger.error(
          `Workshop automation "${kind}" failed to send in workspace ${workspaceId}: ${result.error}`,
        );
      }
    }, authContext);
  }

  private resolveTemplateId(
    kind: WorkshopAutomationKind,
    settings: WorkshopAutomationSettingsEntity,
  ): RecipientLookup {
    switch (kind) {
      case WorkshopAutomationKind.SIGNUP_CONFIRMATION:
        return {
          templateId: settings.signupConfirmationEnabled
            ? settings.signupConfirmationTemplateId
            : null,
          needsOpportunity: false,
        };
      case WorkshopAutomationKind.REMINDER_DAY_BEFORE:
        return {
          templateId: settings.remindersEnabled ? settings.reminderDayBeforeTemplateId : null,
          needsOpportunity: false,
        };
      case WorkshopAutomationKind.REMINDER_ONE_HOUR_BEFORE:
        return {
          templateId: settings.remindersEnabled ? settings.reminderOneHourBeforeTemplateId : null,
          needsOpportunity: false,
        };
      case WorkshopAutomationKind.REMINDER_AT_START:
        return {
          templateId: settings.remindersEnabled ? settings.reminderAtStartTemplateId : null,
          needsOpportunity: false,
        };
      case WorkshopAutomationKind.FOLLOW_UP:
        return {
          templateId: settings.followUpEnabled ? settings.followUpTemplateId : null,
          needsOpportunity: true,
        };
      case WorkshopAutomationKind.RECOVERY:
        return {
          templateId: settings.recoveryEnabled ? settings.recoveryTemplateId : null,
          needsOpportunity: true,
        };
    }
  }
}
```

Before finalizing: confirm the real `person.phones` field shape (likely a composite `PhonesMetadata`-style column, not a flat `primaryPhoneNumber` string — check how `FunnelLeadCrmSyncService`'s `parseFunnelLeadPhone` result is stored on `person.phones` when created, and read that shape back out the same way here) and the real stage string literals (`'NEW'`/`'MEETING'`/`'CUSTOMER'` are used in this plan based on `FunnelLeadCrmSyncService` and the earlier audit memory noting Part B moves to `CUSTOMER` — confirm against the actual `OpportunityWorkspaceEntity` stage options/enum before relying on the literal).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/zyra-server && npx jest workshop-automation.job.spec.ts`
Expected: PASS (all 6 cases) — note the test mocks assume `person` lookup only happens after the stage check passes and a template id is resolved; if the implementation's exact call order differs, adjust the test's `findRecordsService.execute` mock to resolve per-call (`mockImplementationOnce` chaining) rather than a single blanket `mockResolvedValue`.

- [ ] **Step 5: Lint and typecheck**

Run: `npx nx lint:diff-with-main zyra-server` then `npx nx typecheck zyra-server`

- [ ] **Step 6: Commit**

```bash
git add packages/zyra-server/src/modules/workshop-automation/jobs
git commit -m "feat(server): WorkshopAutomationJob (processor BullMQ com checagem de stage)"
```

---

### Task 5: Wire the module together + trigger from `FunnelLeadCrmSyncService`

**Files:**
- Create: `packages/zyra-server/src/modules/workshop-automation/workshop-automation.module.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/funnel-page/services/funnel-lead-crm-sync.service.ts`
- Modify: the module that already provides `FunnelLeadCrmSyncService` (find it — likely `funnel-page.module.ts`) to import `WorkshopAutomationModule`
- Test: extend whatever existing test file covers `FunnelLeadCrmSyncService` (find it first — not confirmed to exist in the research pass; if none exists, create `packages/zyra-server/src/engine/metadata-modules/funnel-page/services/__tests__/funnel-lead-crm-sync.service.spec.ts` covering only the new call, not the whole service)

**Interfaces:**
- Consumes: `WorkshopAutomationSchedulerService.scheduleForOpportunity` (Task 3).

- [ ] **Step 1: Write the module**

```ts
// packages/zyra-server/src/modules/workshop-automation/workshop-automation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WhatsappTemplateModule } from 'src/engine/metadata-modules/whatsapp-template/whatsapp-template.module';
import { WorkshopAutomationSettingsEntity } from 'src/modules/workshop-automation/entities/workshop-automation-settings.entity';
import { WorkshopAutomationJob } from 'src/modules/workshop-automation/jobs/workshop-automation.job';
import { WorkshopAutomationSchedulerService } from 'src/modules/workshop-automation/services/workshop-automation-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkshopAutomationSettingsEntity], 'core'),
    WhatsappTemplateModule,
  ],
  providers: [WorkshopAutomationSchedulerService, WorkshopAutomationJob],
  exports: [WorkshopAutomationSchedulerService],
})
export class WorkshopAutomationModule {}
```

Confirm `WhatsappTemplateModule`'s real name/path (it may need to be created as part of Task 1 Step 7 if it didn't already exist — use whatever name was actually chosen there) and the real `'core'` connection-name convention (same note as plan-tier Task 2, Step 5).

- [ ] **Step 2: Write the failing test for the new trigger call**

```ts
// in funnel-lead-crm-sync.service's test file — add this case to whatever
// existing describe block covers createOpportunity / syncLeadToCrm, or
// create the file fresh if none exists, following this codebase's existing
// pattern for mocking globalWorkspaceOrmManager.executeInWorkspaceContext
// as `(callback) => callback()` (seen in Task 4's job test above)
it('schedules workshop automations after creating a workshop opportunity', async () => {
  // arrange: createRecordService.execute resolves success with a record id,
  // lead.sessionScheduledAt set, pageSlug a workshop slug (not 'contato')
  // act: call syncLeadToCrm(...)
  // assert: workshopAutomationSchedulerService.scheduleForOpportunity was
  // called with { workspaceId, opportunityId: <created id>, sessionScheduledAt: lead.sessionScheduledAt }
});

it('does not schedule workshop automations for the generic contact form', async () => {
  // arrange: same as above but pageSlug: 'contato'
  // act + assert: scheduleForOpportunity was NOT called
});
```

Fill in the arrange/act/assert using this file's actual existing mocking conventions for `createRecordService`/`findRecordsService` (read the file fully — it's already open in context from the earlier research read — before writing the concrete mock values).

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest funnel-lead-crm-sync.service`
Expected: FAIL on the two new cases

- [ ] **Step 4: Wire the call into `createOpportunity`**

In `funnel-lead-crm-sync.service.ts`, inject `WorkshopAutomationSchedulerService` via the constructor, and at the end of `createOpportunity` (after the existing success check, inside the method, not inside `syncLeadToCrm`'s try/catch boundary change) add:

```ts
if (pageSlug !== CONTACT_PAGE_SLUG && isDefined(lead.sessionScheduledAt)) {
  const createdOpportunityId = getRecordId(createdOpportunity.result);

  if (isDefined(createdOpportunityId)) {
    await this.workshopAutomationSchedulerService.scheduleForOpportunity({
      workspaceId: authContext.workspace.id,
      opportunityId: createdOpportunityId,
      sessionScheduledAt: lead.sessionScheduledAt,
    });
  }
}
```

`createOpportunity` doesn't currently take `workspaceId` as its own parameter — read the real `authContext` type (`WorkspaceAuthContext`) to confirm the correct path to the workspace id (used elsewhere in this same file's pattern, e.g. via `buildSystemAuthContext(workspaceId)` at the call site in `syncLeadToCrm` — thread `workspaceId` through to `createOpportunity`'s parameters alongside `authContext` if it isn't already reachable from `authContext` itself).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/zyra-server && npx jest funnel-lead-crm-sync.service`
Expected: PASS

- [ ] **Step 6: Wire the module import**

Add `WorkshopAutomationModule` to the `imports` array of whatever module currently provides `FunnelLeadCrmSyncService` (find and read it first).

- [ ] **Step 7: Typecheck and lint**

Run: `npx nx typecheck zyra-server` then `npx nx lint:diff-with-main zyra-server`

- [ ] **Step 8: Commit**

```bash
git add packages/zyra-server/src/modules/workshop-automation/workshop-automation.module.ts packages/zyra-server/src/engine/metadata-modules/funnel-page
git commit -m "feat(server): aciona agendamento de automacoes do workshop ao criar a oportunidade"
```

---

### Task 6: GraphQL resolver for reading/updating settings

**Files:**
- Create: `packages/zyra-server/src/modules/workshop-automation/dtos/workshop-automation-settings.dto.ts`
- Create: `packages/zyra-server/src/modules/workshop-automation/dtos/update-workshop-automation-settings.input.ts`
- Create: `packages/zyra-server/src/modules/workshop-automation/resolvers/workshop-automation-settings.resolver.ts`
- Modify: `workshop-automation.module.ts` (Task 5) to register the resolver and import `PlanTierModule` (from the plan-tier plan — see this plan's "Depends on" note)
- Test: `packages/zyra-server/src/modules/workshop-automation/resolvers/__tests__/workshop-automation-settings.resolver.spec.ts`

**Interfaces:**
- Produces: GraphQL `query workshopAutomationSettings: WorkshopAutomationSettings` and `mutation updateWorkshopAutomationSettings(input: UpdateWorkshopAutomationSettingsInput!): WorkshopAutomationSettings`, guarded by `WorkspaceAuthGuard` + `PlanFeatureGuard(PlanGatedFeature.WHATSAPP)`.

- [ ] **Step 1: Write the DTO and input type**

```ts
// packages/zyra-server/src/modules/workshop-automation/dtos/workshop-automation-settings.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkshopAutomationSettings')
export class WorkshopAutomationSettingsDTO {
  @Field(() => Boolean)
  signupConfirmationEnabled: boolean;

  @Field(() => String, { nullable: true })
  signupConfirmationTemplateId: string | null;

  @Field(() => Boolean)
  remindersEnabled: boolean;

  @Field(() => String, { nullable: true })
  reminderDayBeforeTemplateId: string | null;

  @Field(() => String, { nullable: true })
  reminderOneHourBeforeTemplateId: string | null;

  @Field(() => String, { nullable: true })
  reminderAtStartTemplateId: string | null;

  @Field(() => Boolean)
  followUpEnabled: boolean;

  @Field(() => String, { nullable: true })
  followUpTemplateId: string | null;

  @Field(() => Boolean)
  recoveryEnabled: boolean;

  @Field(() => String, { nullable: true })
  recoveryTemplateId: string | null;
}
```

```ts
// packages/zyra-server/src/modules/workshop-automation/dtos/update-workshop-automation-settings.input.ts
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkshopAutomationSettingsInput {
  @Field(() => Boolean, { nullable: true })
  signupConfirmationEnabled?: boolean;

  @Field(() => String, { nullable: true })
  signupConfirmationTemplateId?: string | null;

  @Field(() => Boolean, { nullable: true })
  remindersEnabled?: boolean;

  @Field(() => String, { nullable: true })
  reminderDayBeforeTemplateId?: string | null;

  @Field(() => String, { nullable: true })
  reminderOneHourBeforeTemplateId?: string | null;

  @Field(() => String, { nullable: true })
  reminderAtStartTemplateId?: string | null;

  @Field(() => Boolean, { nullable: true })
  followUpEnabled?: boolean;

  @Field(() => String, { nullable: true })
  followUpTemplateId?: string | null;

  @Field(() => Boolean, { nullable: true })
  recoveryEnabled?: boolean;

  @Field(() => String, { nullable: true })
  recoveryTemplateId?: string | null;
}
```

- [ ] **Step 2: Write the failing resolver test**

```ts
// packages/zyra-server/src/modules/workshop-automation/resolvers/__tests__/workshop-automation-settings.resolver.spec.ts
import { WorkshopAutomationSettingsResolver } from 'src/modules/workshop-automation/resolvers/workshop-automation-settings.resolver';

describe('WorkshopAutomationSettingsResolver', () => {
  const settingsRepository = {
    findOne: jest.fn(),
    upsert: jest.fn(),
  };

  const buildResolver = () =>
    new WorkshopAutomationSettingsResolver(settingsRepository as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns default-disabled settings when no row exists yet', async () => {
    settingsRepository.findOne.mockResolvedValue(null);

    const result = await buildResolver().workshopAutomationSettings({
      workspace: { id: 'workspace-1' },
    } as never);

    expect(result.signupConfirmationEnabled).toBe(false);
    expect(result.remindersEnabled).toBe(false);
  });

  it('upserts the provided fields and returns the updated row', async () => {
    settingsRepository.upsert.mockResolvedValue(undefined);
    settingsRepository.findOne.mockResolvedValue({
      workspaceId: 'workspace-1',
      signupConfirmationEnabled: true,
      signupConfirmationTemplateId: 'template-1',
      remindersEnabled: false,
      reminderDayBeforeTemplateId: null,
      reminderOneHourBeforeTemplateId: null,
      reminderAtStartTemplateId: null,
      followUpEnabled: false,
      followUpTemplateId: null,
      recoveryEnabled: false,
      recoveryTemplateId: null,
    });

    const result = await buildResolver().updateWorkshopAutomationSettings(
      { workspace: { id: 'workspace-1' } } as never,
      { signupConfirmationEnabled: true, signupConfirmationTemplateId: 'template-1' },
    );

    expect(settingsRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-1',
        signupConfirmationEnabled: true,
        signupConfirmationTemplateId: 'template-1',
      }),
      ['workspaceId'],
    );
    expect(result.signupConfirmationEnabled).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest workshop-automation-settings.resolver.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write the resolver**

```ts
// packages/zyra-server/src/modules/workshop-automation/resolvers/workshop-automation-settings.resolver.ts
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { type Request } from 'express';
import { Repository } from 'typeorm';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { PlanFeatureGuard } from 'src/engine/guards/plan-feature.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UpdateWorkshopAutomationSettingsInput } from 'src/modules/workshop-automation/dtos/update-workshop-automation-settings.input';
import { WorkshopAutomationSettingsDTO } from 'src/modules/workshop-automation/dtos/workshop-automation-settings.dto';
import { WorkshopAutomationSettingsEntity } from 'src/modules/workshop-automation/entities/workshop-automation-settings.entity';

const DEFAULT_SETTINGS: WorkshopAutomationSettingsDTO = {
  signupConfirmationEnabled: false,
  signupConfirmationTemplateId: null,
  remindersEnabled: false,
  reminderDayBeforeTemplateId: null,
  reminderOneHourBeforeTemplateId: null,
  reminderAtStartTemplateId: null,
  followUpEnabled: false,
  followUpTemplateId: null,
  recoveryEnabled: false,
  recoveryTemplateId: null,
};

@Resolver()
@UseGuards(WorkspaceAuthGuard, PlanFeatureGuard(PlanGatedFeature.WHATSAPP))
export class WorkshopAutomationSettingsResolver {
  constructor(
    @InjectRepository(WorkshopAutomationSettingsEntity)
    private readonly settingsRepository: Repository<WorkshopAutomationSettingsEntity>,
  ) {}

  @Query(() => WorkshopAutomationSettingsDTO)
  async workshopAutomationSettings(
    @Args('request') request: Request & { workspace: { id: string } },
  ): Promise<WorkshopAutomationSettingsDTO> {
    const settings = await this.settingsRepository.findOne({
      where: { workspaceId: request.workspace.id },
    });

    return settings ?? DEFAULT_SETTINGS;
  }

  @Mutation(() => WorkshopAutomationSettingsDTO)
  async updateWorkshopAutomationSettings(
    @Args('request') request: Request & { workspace: { id: string } },
    @Args('input') input: UpdateWorkshopAutomationSettingsInput,
  ): Promise<WorkshopAutomationSettingsDTO> {
    await this.settingsRepository.upsert(
      { workspaceId: request.workspace.id, ...input },
      ['workspaceId'],
    );

    const updated = await this.settingsRepository.findOne({
      where: { workspaceId: request.workspace.id },
    });

    return updated ?? DEFAULT_SETTINGS;
  }
}
```

The `@Args('request') request: Request` pattern above is almost certainly wrong for how this codebase actually injects the current request/workspace into a resolver method (other resolvers read it via `@Context()` or a custom param decorator, not `@Args`) — re-read `connect-whatsapp-number.resolver.ts`'s method signature (already fetched during research) for the real pattern and use that instead; this plan flags the mismatch rather than presenting an untested guess as fact.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/zyra-server && npx jest workshop-automation-settings.resolver.spec.ts`
Expected: PASS

- [ ] **Step 6: Register the resolver in the module**

Add `WorkshopAutomationSettingsResolver` to `workshop-automation.module.ts`'s `providers` array, and `PlanTierModule` to its `imports` (needed for `PlanFeatureGuard`'s dependency, per the plan-tier plan's Task 3).

- [ ] **Step 7: Regenerate frontend GraphQL types**

Run: `npx nx run asturian-front:graphql:generate`

- [ ] **Step 8: Typecheck and lint**

Run: `npx nx typecheck zyra-server` then `npx nx lint:diff-with-main zyra-server`

- [ ] **Step 9: Commit**

```bash
git add packages/zyra-server/src/modules/workshop-automation packages/asturian-front/src/generated-metadata packages/asturian-front/src/generated
git commit -m "feat(server): resolver GraphQL de configuracoes de automacao do workshop"
```

---

### Task 7: Frontend settings page

**Files:**
- Create: `packages/asturian-front/src/pages/settings/workshop-automation/SettingsWorkshopAutomations.tsx`
- Create: `packages/asturian-front/src/modules/workshop-automation/components/WorkshopAutomationToggleSection.tsx`
- Modify: `zyra-shared/src/types` (`SettingsPath` — add `WorkshopAutomations` member)
- Modify: `packages/asturian-front/src/modules/app/components/SettingsRoutes.tsx` (add the route, nested under the existing `Accounts`/WhatsApp-adjacent group given this page only makes sense once WhatsApp is connected)
- Modify: wherever the settings nav list is built (same file identified in the plan-tier plan's Task 8, Step 9) — add a nav entry, gated the same way (hidden for BASIC tier)
- Test: `packages/asturian-front/src/pages/settings/workshop-automation/__tests__/SettingsWorkshopAutomations.test.tsx`

**Interfaces:**
- Consumes: the `workshopAutomationSettings` query and `updateWorkshopAutomationSettings` mutation (Task 6), regenerated as Apollo hooks under whatever naming convention `graphql:generate` produces (confirm the exact hook names — e.g. `useWorkshopAutomationSettingsQuery` — by inspecting the generated output after Task 6 Step 7, rather than guessing here).
- Consumes: the existing WhatsApp templates list query (find it — used wherever templates are already picked elsewhere, e.g. the workflow action's settings UI) for the template-picker dropdown options.

- [ ] **Step 1: Write `WorkshopAutomationToggleSection`, a small reusable section**

```tsx
// packages/asturian-front/src/modules/workshop-automation/components/WorkshopAutomationToggleSection.tsx
import { styled } from '@linaria/react';

import { Toggle } from 'twenty-ui/input'; // confirm the real toggle component import path used elsewhere in this codebase before finalizing
import { Select } from 'twenty-ui/input'; // same for the select/dropdown component

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const StyledTemplatePickerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export type WorkshopAutomationTemplateSlot = {
  label: string;
  templateId: string | null;
  onChange: (templateId: string | null) => void;
};

export type WorkshopAutomationToggleSectionProps = {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  templateOptions: Array<{ value: string; label: string }>;
  templateSlots: WorkshopAutomationTemplateSlot[];
};

export const WorkshopAutomationToggleSection = ({
  title,
  description,
  enabled,
  onToggle,
  templateOptions,
  templateSlots,
}: WorkshopAutomationToggleSectionProps) => {
  return (
    <StyledSection>
      <Toggle value={enabled} onChange={onToggle} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {enabled &&
        templateSlots.map((slot) => (
          <StyledTemplatePickerRow key={slot.label}>
            <span>{slot.label}</span>
            <Select
              dropdownId={`workshop-automation-${slot.label}`}
              value={slot.templateId ?? undefined}
              options={templateOptions}
              onChange={(value) => slot.onChange(value ?? null)}
            />
          </StyledTemplatePickerRow>
        ))}
    </StyledSection>
  );
};
```

Before finalizing: find one existing settings-page component in this codebase that already renders a toggle + dropdown pair (e.g. somewhere under `pages/settings/`) and match its real `Toggle`/`Select` (or equivalent) import paths and prop names exactly — the names above (`twenty-ui/input`, `Toggle`, `Select`, `dropdownId`) are placeholders standing in for whatever this codebase's real design-system component names turn out to be; this step cannot be completed correctly without reading a real example first.

- [ ] **Step 2: Write the page component**

```tsx
// packages/asturian-front/src/pages/settings/workshop-automation/SettingsWorkshopAutomations.tsx
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { WorkshopAutomationToggleSection } from '@/workshop-automation/components/WorkshopAutomationToggleSection';
import { useLingui } from '@lingui/react/macro';

// Replace these two with the real generated hooks once Task 6's codegen
// output is confirmed (see this task's Interfaces note).
import {
  useWorkshopAutomationSettingsQuery,
  useUpdateWorkshopAutomationSettingsMutation,
} from '~/generated-metadata/graphql';

export const SettingsWorkshopAutomations = () => {
  const { t } = useLingui();
  const { data } = useWorkshopAutomationSettingsQuery();
  const [updateSettings] = useUpdateWorkshopAutomationSettingsMutation();

  const settings = data?.workshopAutomationSettings;

  // Replace with the real WhatsApp templates list query/hook used elsewhere.
  const templateOptions: Array<{ value: string; label: string }> = [];

  if (!settings) {
    return null;
  }

  return (
    <SettingsPageLayout
      title={t`Automações do Workshop`}
      links={[{ children: t`Workspace` }, { children: t`Automações do Workshop` }]}
    >
      <SettingsPageContainer>
        <WorkshopAutomationToggleSection
          title={t`Confirmação de inscrição`}
          description={t`Envia uma mensagem assim que alguém se inscreve no workshop.`}
          enabled={settings.signupConfirmationEnabled}
          onToggle={(enabled) =>
            updateSettings({ variables: { input: { signupConfirmationEnabled: enabled } } })
          }
          templateOptions={templateOptions}
          templateSlots={[
            {
              label: t`Modelo`,
              templateId: settings.signupConfirmationTemplateId,
              onChange: (templateId) =>
                updateSettings({
                  variables: { input: { signupConfirmationTemplateId: templateId } },
                }),
            },
          ]}
        />
        <WorkshopAutomationToggleSection
          title={t`Lembretes`}
          description={t`Envia lembretes na véspera, 1 hora antes e na hora do workshop.`}
          enabled={settings.remindersEnabled}
          onToggle={(enabled) =>
            updateSettings({ variables: { input: { remindersEnabled: enabled } } })
          }
          templateOptions={templateOptions}
          templateSlots={[
            {
              label: t`Véspera`,
              templateId: settings.reminderDayBeforeTemplateId,
              onChange: (templateId) =>
                updateSettings({
                  variables: { input: { reminderDayBeforeTemplateId: templateId } },
                }),
            },
            {
              label: t`1 hora antes`,
              templateId: settings.reminderOneHourBeforeTemplateId,
              onChange: (templateId) =>
                updateSettings({
                  variables: { input: { reminderOneHourBeforeTemplateId: templateId } },
                }),
            },
            {
              label: t`Na hora`,
              templateId: settings.reminderAtStartTemplateId,
              onChange: (templateId) =>
                updateSettings({
                  variables: { input: { reminderAtStartTemplateId: templateId } },
                }),
            },
          ]}
        />
        <WorkshopAutomationToggleSection
          title={t`Follow-up pós-workshop`}
          description={t`Envia uma mensagem no dia seguinte para quem participou e ainda não comprou.`}
          enabled={settings.followUpEnabled}
          onToggle={(enabled) =>
            updateSettings({ variables: { input: { followUpEnabled: enabled } } })
          }
          templateOptions={templateOptions}
          templateSlots={[
            {
              label: t`Modelo`,
              templateId: settings.followUpTemplateId,
              onChange: (templateId) =>
                updateSettings({ variables: { input: { followUpTemplateId: templateId } } }),
            },
          ]}
        />
        <WorkshopAutomationToggleSection
          title={t`Recuperação de ausentes`}
          description={t`Envia uma mensagem a quem se inscreveu mas não compareceu.`}
          enabled={settings.recoveryEnabled}
          onToggle={(enabled) =>
            updateSettings({ variables: { input: { recoveryEnabled: enabled } } })
          }
          templateOptions={templateOptions}
          templateSlots={[
            {
              label: t`Modelo`,
              templateId: settings.recoveryTemplateId,
              onChange: (templateId) =>
                updateSettings({ variables: { input: { recoveryTemplateId: templateId } } }),
            },
          ]}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
```

- [ ] **Step 3: Write the behavior test**

```tsx
// packages/asturian-front/src/pages/settings/workshop-automation/__tests__/SettingsWorkshopAutomations.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsWorkshopAutomations } from '@/settings/workshop-automation/pages/SettingsWorkshopAutomations';

// Wrap with whatever MockedProvider / Apollo test harness this codebase's
// other settings-page tests already use (e.g. SettingsFunnel's own test
// file, if one exists — mirror its provider setup exactly) and mock the
// workshopAutomationSettings query to resolve remindersEnabled: false.

describe('SettingsWorkshopAutomations', () => {
  it('hides the three reminder template pickers until the reminders toggle is on', async () => {
    render(<SettingsWorkshopAutomations />);

    expect(screen.queryByText('Véspera')).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('switch')[1]);

    expect(await screen.findByText('Véspera')).toBeInTheDocument();
    expect(screen.getByText('1 hora antes')).toBeInTheDocument();
    expect(screen.getByText('Na hora')).toBeInTheDocument();
  });
});
```

Confirm whether this codebase's toggle component renders with an accessible `role="switch"` (as assumed above) by checking one real existing settings-toggle test, and adjust the query accordingly (`getByRole('switch')` vs `getByLabelText(...)` vs a `data-testid`).

- [ ] **Step 4: Run the test**

Run: `cd packages/asturian-front && npx jest SettingsWorkshopAutomations`
Expected: PASS

- [ ] **Step 5: Add the route and nav entry**

Add `SettingsPath.WorkshopAutomations` to the shared enum, a `<Route>` in `SettingsRoutes.tsx` nested next to the WhatsApp-related routes (`SettingsPath.AccountsWhatsapp` / `AccountsWhatsappTemplates`), and one nav entry in the same settings-nav file the plan-tier plan's Task 8 touches — applying the same `PLAN_GATED_SETTINGS_PATHS`-style hide-for-BASIC-tier treatment to this new path too (reuse that set from the other plan rather than duplicating the gating logic).

- [ ] **Step 6: Lint and typecheck**

Run: `npx nx lint:diff-with-main asturian-front` then `npx oxlint --type-aware` on every file touched in this task.

- [ ] **Step 7: Commit**

```bash
git add packages/asturian-front/src/pages/settings/workshop-automation packages/asturian-front/src/modules/workshop-automation packages/asturian-front/src/modules/app/components/SettingsRoutes.tsx
git commit -m "feat(front): tela de configuracoes de automacoes do WhatsApp do workshop"
```

---

## Self-review notes

- Spec coverage: shared sender extraction (Task 1), settings entity (Task 2), scheduler with hardcoded offsets (Task 3), fire-time stage/toggle re-check (Task 4), trigger wiring from signup (Task 5), GraphQL surface + plan-tier gate (Task 6), guided settings UI (Task 7) — every "Design — Part A" bullet in the spec has a task.
- Flagged, not hidden, uncertainties: the resolver's request-context access pattern (Task 6, Step 4), the design-system component names (Task 7, Step 1), the generated Apollo hook names (Task 7, Step 2), the `person.phones` field shape and `Opportunity` stage literals (Task 4, Step 3), and `MessageQueueService.add`'s exact options signature (Task 3, Step 4) are each called out as "confirm against the real file before finalizing" rather than asserted as fact — each is a single, bounded lookup the implementing agent does as the first action of that step, not an open design question.
- Type consistency check: `WorkshopAutomationJobData` (Task 3) is the exact type consumed by `WorkshopAutomationJob.handle` (Task 4) and produced by `WorkshopAutomationSchedulerService.scheduleForOpportunity` (Task 3) — same shape used in both. `WhatsappTemplateSenderService.sendByTemplateId`'s signature (Task 1) matches every call site in Tasks 4, 6 is unaffected (settings CRUD only), and Task 7's mutation input field names match `UpdateWorkshopAutomationSettingsInput` (Task 6) exactly.
