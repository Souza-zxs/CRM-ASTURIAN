# Plan-tier gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a per-workspace BASIC/PRO plan tier, gate WhatsApp/Instagram/Voice Agent/Workflows/custom-objects behind PRO, grandfather existing workspaces that already use any of those, and hide gated items from the nav for BASIC-tier workspaces.

**Architecture:** A new `plan-tier` core module exposes `WorkspacePlanTierService.getWorkspacePlanTier(workspaceId)` (PRO if an active Stripe subscription exists OR a grandfather row exists, else BASIC) and a `PlanFeatureGuard` mixin-factory (mirrors the existing `SettingsPermissionGuard` shape) applied alongside existing guards on 5 resolver mutations. A `currentWorkspacePlanTier` GraphQL field lets the frontend read it; a small extension to the existing nav-item filter hides gated nav entries for BASIC workspaces and adds one upsell nav entry.

**Tech Stack:** NestJS, TypeORM (core schema), GraphQL (code-first), React, Jotai/Apollo cache, Linaria, Lingui.

## Global Constraints

- Only named exports, functional components, types (not interfaces) except extending third-party interfaces, no `any`, no abbreviations in variable names (per CLAUDE.md).
- New entity tables are created via **instance commands**, never hand-written TypeORM migrations (`core.datasource.ts` explicitly freezes the old migration system — see header comment in that file).
- Run `npx nx lint:diff-with-main zyra-server` / `asturian-front` and `npx nx typecheck zyra-server` / `asturian-front` after each task touching that package.
- After any GraphQL schema change, run `npx nx run asturian-front:graphql:generate` before writing frontend code that consumes it.
- Commit after every task.

---

### Task 1: Plan-tier enums + grandfather entity + fast instance command

**Files:**
- Create: `packages/zyra-server/src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum.ts`
- Create: `packages/zyra-server/src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum.ts`
- Create: `packages/zyra-server/src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity.ts`
- Create (generated): an instance command file under `packages/zyra-server/src/database/commands/instance-commands/` (exact path/timestamp assigned by the generator — see Step 3)
- Test: `packages/zyra-server/src/engine/core-modules/plan-tier/entities/__tests__/workspace-plan-grandfather.entity.spec.ts`

**Interfaces:**
- Produces: `WorkspacePlanTier` enum with members `BASIC`, `PRO`. `PlanGatedFeature` enum with members `WHATSAPP`, `INSTAGRAM`, `VOICE_AGENT`, `WORKFLOWS`, `CUSTOM_APPS`. `WorkspacePlanGrandfatherEntity` with fields `id: string`, `workspaceId: string`, `reason: string`, `createdAt: Date`.

- [ ] **Step 1: Write the enums**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum.ts
export enum WorkspacePlanTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
}
```

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum.ts
export enum PlanGatedFeature {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  VOICE_AGENT = 'VOICE_AGENT',
  WORKFLOWS = 'WORKFLOWS',
  CUSTOM_APPS = 'CUSTOM_APPS',
}
```

- [ ] **Step 2: Write the entity**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'workspacePlanGrandfather', schema: 'core' })
@Unique('IDX_WORKSPACE_PLAN_GRANDFATHER_WORKSPACE_ID_UNIQUE', ['workspaceId'])
export class WorkspacePlanGrandfatherEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

Read `packages/zyra-server/src/engine/core-modules/feature-flag/feature-flag.entity.ts` first and confirm `WorkspaceRelatedEntity` is the right base (it already supplies `workspaceId`) — match its exact import path and decorator order.

- [ ] **Step 3: Generate the fast instance command**

Run: `npx nx run zyra-server:database:migrate:generate --name create-workspace-plan-grandfather-table --type fast`

This creates a timestamped file and auto-registers it in `instance-commands.constant.ts` (do not hand-edit that file). Open the generated file and implement `up`/`down`:

```ts
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE "core"."workspacePlanGrandfather" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "workspaceId" uuid NOT NULL,
      "reason" text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_WORKSPACE_PLAN_GRANDFATHER" PRIMARY KEY ("id"),
      CONSTRAINT "IDX_WORKSPACE_PLAN_GRANDFATHER_WORKSPACE_ID_UNIQUE" UNIQUE ("workspaceId")
    )
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE "core"."workspacePlanGrandfather"`);
}
```

- [ ] **Step 4: Apply the migration locally**

Run: `npx nx run zyra-server:database:migrate`
Expected: command runs without error; confirm the table exists via the read-only Postgres MCP inspection tool (`workspacePlanGrandfather` under schema `core`).

- [ ] **Step 5: Write a smoke test for the entity shape**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/entities/__tests__/workspace-plan-grandfather.entity.spec.ts
import { getMetadataArgsStorage } from 'typeorm';

import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';

describe('WorkspacePlanGrandfatherEntity', () => {
  it('is registered under the core schema with the expected table name', () => {
    const table = getMetadataArgsStorage().tables.find(
      (entry) => entry.target === WorkspacePlanGrandfatherEntity,
    );

    expect(table?.name).toBe('workspacePlanGrandfather');
    expect(table?.schema).toBe('core');
  });
});
```

- [ ] **Step 6: Run the test**

Run: `cd packages/zyra-server && npx jest entities/__tests__/workspace-plan-grandfather.entity.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/zyra-server/src/engine/core-modules/plan-tier packages/zyra-server/src/database/commands
git commit -m "feat(server): entidade e tabela de grandfather para plan-tier"
```

---

### Task 2: WorkspacePlanTierService

**Files:**
- Create: `packages/zyra-server/src/engine/core-modules/plan-tier/services/workspace-plan-tier.service.ts`
- Create: `packages/zyra-server/src/engine/core-modules/plan-tier/plan-tier.module.ts`
- Test: `packages/zyra-server/src/engine/core-modules/plan-tier/services/__tests__/workspace-plan-tier.service.spec.ts`

**Interfaces:**
- Consumes: `WorkspaceCurrentBillingSubscriptionCacheService` (existing — read its exact method name/signature from `packages/zyra-server/src/engine/core-modules/billing/services/workspace-current-billing-subscription-cache.service.ts` before writing this task; it returns the current `BillingSubscriptionEntity | null` for a workspace). `SubscriptionStatus` enum from `src/engine/core-modules/billing/enums/billing-subscription-status.enum.ts`. `WorkspacePlanGrandfatherEntity` from Task 1 (injected via `@InjectRepository`).
- Produces: `WorkspacePlanTierService.getWorkspacePlanTier(workspaceId: string): Promise<WorkspacePlanTier>` and `WorkspacePlanTierService.hasAccessToFeature(workspaceId: string, feature: PlanGatedFeature): Promise<boolean>` (today: `true` iff tier is `PRO`, for all 5 features — this is intentional, not a bug, see spec).

- [ ] **Step 1: Write the failing test**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/services/__tests__/workspace-plan-tier.service.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { WorkspaceCurrentBillingSubscriptionCacheService } from 'src/engine/core-modules/billing/services/workspace-current-billing-subscription-cache.service';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

describe('WorkspacePlanTierService', () => {
  const findOneGrandfather = jest.fn();
  const getCurrentBillingSubscription = jest.fn();

  const buildService = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkspacePlanTierService,
        {
          provide: WorkspaceCurrentBillingSubscriptionCacheService,
          useValue: { getCurrentBillingSubscription },
        },
        {
          provide: getRepositoryToken(WorkspacePlanGrandfatherEntity),
          useValue: { findOne: findOneGrandfather },
        },
      ],
    }).compile();

    return moduleRef.get(WorkspacePlanTierService);
  };

  beforeEach(() => {
    findOneGrandfather.mockReset();
    getCurrentBillingSubscription.mockReset();
  });

  it('returns PRO when an active subscription exists', async () => {
    getCurrentBillingSubscription.mockResolvedValue({
      status: SubscriptionStatus.ACTIVE,
    });
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.PRO,
    );
  });

  it('returns PRO when grandfathered, even with no subscription', async () => {
    getCurrentBillingSubscription.mockResolvedValue(null);
    findOneGrandfather.mockResolvedValue({ workspaceId: 'workspace-1' });

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.PRO,
    );
  });

  it('returns BASIC when neither an active subscription nor a grandfather row exists', async () => {
    getCurrentBillingSubscription.mockResolvedValue(null);
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(await service.getWorkspacePlanTier('workspace-1')).toBe(
      WorkspacePlanTier.BASIC,
    );
  });

  it('hasAccessToFeature is true only for PRO workspaces', async () => {
    getCurrentBillingSubscription.mockResolvedValue(null);
    findOneGrandfather.mockResolvedValue(null);

    const service = await buildService();

    expect(
      await service.hasAccessToFeature('workspace-1', PlanGatedFeature.WHATSAPP),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest services/__tests__/workspace-plan-tier.service.spec.ts`
Expected: FAIL — `WorkspacePlanTierService` not defined / module not found.

- [ ] **Step 3: Read the real billing cache service signature**

Open `packages/zyra-server/src/engine/core-modules/billing/services/workspace-current-billing-subscription-cache.service.ts` and confirm the exact method name and return type before writing Step 4 — the test above assumes `getCurrentBillingSubscription(workspaceId: string): Promise<BillingSubscriptionEntity | null>`; adjust the implementation (not the already-decided behavior) to match whatever the real signature turns out to be.

- [ ] **Step 4: Write the minimal implementation**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/services/workspace-plan-tier.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { WorkspaceCurrentBillingSubscriptionCacheService } from 'src/engine/core-modules/billing/services/workspace-current-billing-subscription-cache.service';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTier } from 'src/engine/core-modules/plan-tier/enums/workspace-plan-tier.enum';

// Mirrors the set the existing unique index on BillingSubscriptionEntity
// already treats as "has a live paid plan" (see billing-subscription.entity.ts).
const ACTIVE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
];

@Injectable()
export class WorkspacePlanTierService {
  constructor(
    private readonly billingSubscriptionCacheService: WorkspaceCurrentBillingSubscriptionCacheService,
    @InjectRepository(WorkspacePlanGrandfatherEntity)
    private readonly grandfatherRepository: Repository<WorkspacePlanGrandfatherEntity>,
  ) {}

  async getWorkspacePlanTier(workspaceId: string): Promise<WorkspacePlanTier> {
    const subscription =
      await this.billingSubscriptionCacheService.getCurrentBillingSubscription(
        workspaceId,
      );

    if (
      isDefined(subscription) &&
      ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
    ) {
      return WorkspacePlanTier.PRO;
    }

    const grandfather = await this.grandfatherRepository.findOne({
      where: { workspaceId },
    });

    return isDefined(grandfather) ? WorkspacePlanTier.PRO : WorkspacePlanTier.BASIC;
  }

  // All 5 gated features are PRO-only today, so this collapses to "is PRO" —
  // kept as its own method so a future per-feature matrix doesn't require
  // touching every guard call site.
  async hasAccessToFeature(
    workspaceId: string,
    _feature: PlanGatedFeature,
  ): Promise<boolean> {
    return (await this.getWorkspacePlanTier(workspaceId)) === WorkspacePlanTier.PRO;
  }
}
```

Confirm `SubscriptionStatus.TRIALING` / `ACTIVE` / `PAST_DUE` are the real enum member names by reading `billing-subscription-status.enum.ts` before finalizing — adjust names if they differ (the set of three statuses must match the ones already named in the `BillingSubscriptionEntity` partial-unique-index `where` clause read during research).

- [ ] **Step 5: Write the module**

```ts
// packages/zyra-server/src/engine/core-modules/plan-tier/plan-tier.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspacePlanGrandfatherEntity } from 'src/engine/core-modules/plan-tier/entities/workspace-plan-grandfather.entity';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspacePlanGrandfatherEntity], 'core'), BillingModule],
  providers: [WorkspacePlanTierService],
  exports: [WorkspacePlanTierService],
})
export class PlanTierModule {}
```

Confirm the real `BillingModule` export token/path and the real `'core'` TypeORM connection name used elsewhere in this codebase (grep another core-module's `*.module.ts` for `TypeOrmModule.forFeature`) before finalizing — match whatever convention is already in use rather than guessing.

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd packages/zyra-server && npx jest services/__tests__/workspace-plan-tier.service.spec.ts`
Expected: PASS (all 4 cases)

- [ ] **Step 7: Lint and typecheck**

Run: `npx nx lint:diff-with-main zyra-server` then `npx nx typecheck zyra-server`
Expected: no new errors

- [ ] **Step 8: Commit**

```bash
git add packages/zyra-server/src/engine/core-modules/plan-tier
git commit -m "feat(server): WorkspacePlanTierService (PRO via assinatura ativa ou grandfather)"
```

---

### Task 3: PlanFeatureGuard

**Files:**
- Create: `packages/zyra-server/src/engine/guards/plan-feature.guard.ts`
- Test: `packages/zyra-server/src/engine/guards/__tests__/plan-feature.guard.spec.ts`

**Interfaces:**
- Consumes: `WorkspacePlanTierService.hasAccessToFeature` (Task 2). `PlanGatedFeature` enum (Task 1).
- Produces: `PlanFeatureGuard(requiredFeature: PlanGatedFeature): Type<CanActivate>`, same mixin-factory shape as `SettingsPermissionGuard`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/zyra-server/src/engine/guards/__tests__/plan-feature.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';
import { PlanFeatureGuard } from 'src/engine/guards/plan-feature.guard';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: { create: jest.fn() },
}));

describe('PlanFeatureGuard', () => {
  const hasAccessToFeature = jest.fn();
  const workspacePlanTierService = {
    hasAccessToFeature,
  } as unknown as WorkspacePlanTierService;

  const buildContext = (workspaceId: string): ExecutionContext => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: () => ({ req: { workspace: { id: workspaceId } } }),
    });

    return {} as ExecutionContext;
  };

  beforeEach(() => hasAccessToFeature.mockReset());

  it('allows the request when the workspace has access to the feature', async () => {
    hasAccessToFeature.mockResolvedValue(true);

    const GuardClass = PlanFeatureGuard(PlanGatedFeature.WHATSAPP);
    const guard = new GuardClass(workspacePlanTierService);

    await expect(guard.canActivate(buildContext('workspace-1'))).resolves.toBe(
      true,
    );
  });

  it('throws when the workspace does not have access', async () => {
    hasAccessToFeature.mockResolvedValue(false);

    const GuardClass = PlanFeatureGuard(PlanGatedFeature.WHATSAPP);
    const guard = new GuardClass(workspacePlanTierService);

    await expect(guard.canActivate(buildContext('workspace-1'))).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/zyra-server && npx jest guards/__tests__/plan-feature.guard.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the minimal implementation**

```ts
// packages/zyra-server/src/engine/guards/plan-feature.guard.ts
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { WorkspacePlanTierService } from 'src/engine/core-modules/plan-tier/services/workspace-plan-tier.service';

export const PlanFeatureGuard = (
  requiredFeature: PlanGatedFeature,
): Type<CanActivate> => {
  @Injectable()
  class PlanFeatureMixin implements CanActivate {
    constructor(
      private readonly workspacePlanTierService: WorkspacePlanTierService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const workspaceId = ctx.getContext().req.workspace.id;

      const hasAccess = await this.workspacePlanTierService.hasAccessToFeature(
        workspaceId,
        requiredFeature,
      );

      if (hasAccess) {
        return true;
      }

      throw new ForbiddenException(
        'This feature is only available on the Pro plan. Upgrade your workspace to use it.',
      );
    }
  }

  return mixin(PlanFeatureMixin);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/zyra-server && npx jest guards/__tests__/plan-feature.guard.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/zyra-server/src/engine/guards/plan-feature.guard.ts packages/zyra-server/src/engine/guards/__tests__/plan-feature.guard.spec.ts
git commit -m "feat(server): PlanFeatureGuard para gating por plano"
```

---

### Task 4: Apply the guard to the 5 resolver entry points

**Files:**
- Modify: `packages/zyra-server/src/modules/whatsapp/resolvers/connect-whatsapp-number.resolver.ts`
- Modify: `packages/zyra-server/src/modules/instagram/resolvers/connect-instagram-account.resolver.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/voice-agent/resolvers/voice-agent.resolver.ts`
- Modify: `packages/zyra-server/src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver.ts`
- Modify: `packages/zyra-server/src/engine/metadata-modules/object-metadata/object-metadata.resolver.ts`
- Modify: each resolver's owning `*.module.ts` to import `PlanTierModule` (Task 2) so `WorkspacePlanTierService` resolves in the guard — check each resolver's existing module file and add `PlanTierModule` to its `imports` array if not already reachable.
- Test: for each resolver that already has a `.spec.ts` file, extend it; otherwise skip (do not add new resolver test scaffolding beyond what each resolver already has — out of scope for this task).

**Interfaces:**
- Consumes: `PlanFeatureGuard` (Task 3), `PlanGatedFeature` (Task 1).

- [ ] **Step 1: Read each file's current guard usage before editing**

Open all five files above and note the exact current `@UseGuards(...)` call (class-level vs per-method) in each — Task plan intentionally does not hardcode the "before" snippets here since they must be copied verbatim from the real files to avoid clobbering guards already in place.

- [ ] **Step 2: Add `PlanFeatureGuard` to `connect-whatsapp-number.resolver.ts`**

In the existing `@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))` class decorator, append `PlanFeatureGuard(PlanGatedFeature.WHATSAPP)` as an additional argument, and add the two corresponding imports:

```ts
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';
import { PlanFeatureGuard } from 'src/engine/guards/plan-feature.guard';
```

- [ ] **Step 3: Add `PlanFeatureGuard` to `connect-instagram-account.resolver.ts`**

Same pattern as Step 2, with `PlanGatedFeature.INSTAGRAM`.

- [ ] **Step 4: Add `PlanFeatureGuard` to all three mutations in `voice-agent.resolver.ts`**

Each of the three mutations (around lines 36, 59, 84 per the research pass — confirm exact lines by reading the file, since line numbers shift) has its own `@UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))`. Append `PlanFeatureGuard(PlanGatedFeature.VOICE_AGENT)` to each of the three, same imports as Step 2.

- [ ] **Step 5: Add `PlanFeatureGuard` to the trigger-activation mutation in `workflow-trigger.resolver.ts`**

Read the file to find the mutation that activates/enables a trigger (as opposed to read-only queries) and add `PlanFeatureGuard(PlanGatedFeature.WORKFLOWS)` to its guard list, creating a class- or method-level `@UseGuards(...)` matching whatever's already there (add one if none exists yet, following the `WorkspaceAuthGuard` pattern used by the other 4 resolvers in this task).

- [ ] **Step 6: Add `PlanFeatureGuard` to `createOneObject` in `object-metadata.resolver.ts`**

Append `PlanFeatureGuard(PlanGatedFeature.CUSTOM_APPS)` to the existing `@UseGuards(..., SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))` on the `createOneObject` mutation (around line 164 per research — confirm by reading).

- [ ] **Step 7: Wire `PlanTierModule` into each resolver's module**

For each of the 5 modules owning these resolvers, add `PlanTierModule` to the `imports` array if `WorkspacePlanTierService` isn't already reachable through an existing shared module import. Read each `*.module.ts` first; only add the import where it's missing.

- [ ] **Step 8: Typecheck and lint**

Run: `npx nx typecheck zyra-server` then `npx nx lint:diff-with-main zyra-server`
Expected: no new errors (this task is guard wiring only, no new logic, so a typecheck failure here almost always means a wrong import path or a module not actually exporting `WorkspacePlanTierService` — fix at the source, don't work around it).

- [ ] **Step 9: Run each touched resolver's existing test suite**

Run (adjust per resolver, matching whatever is already there):
`cd packages/zyra-server && npx jest connect-whatsapp-number.resolver connect-instagram-account.resolver voice-agent.resolver workflow-trigger.resolver object-metadata.resolver`
Expected: all previously-passing tests still PASS (a break here means the guard was added in a way that changed the resolver's existing auth behavior — revert and re-check Step 1's "before" state).

- [ ] **Step 10: Commit**

```bash
git add packages/zyra-server/src/modules/whatsapp packages/zyra-server/src/modules/instagram packages/zyra-server/src/engine/metadata-modules/voice-agent packages/zyra-server/src/engine/core-modules/workflow packages/zyra-server/src/engine/metadata-modules/object-metadata
git commit -m "feat(server): aplica PlanFeatureGuard nos 5 pontos de entrada gated"
```

---

### Task 5: Expose plan tier over GraphQL

**Files:**
- Modify: `packages/zyra-server/src/engine/core-modules/client-config/client-config.entity.ts` (add one field)
- Modify: whatever service builds the `ClientConfig` response (find it by searching for where `ClientConfig` object literal is constructed — likely `client-config.service.ts`)
- Test: extend that service's existing spec file if one exists.

**Interfaces:**
- Consumes: `WorkspacePlanTierService.getWorkspacePlanTier` (Task 2).
- Produces: `ClientConfig.currentWorkspacePlanTier: WorkspacePlanTier` (nullable — `null` for unauthenticated/no-workspace contexts, matching how other workspace-scoped `ClientConfig` fields already behave; read one of those — e.g. `isWorkspaceSchemaDDLLocked` — to confirm the nullability convention before writing this field).

- [ ] **Step 1: Read how `ClientConfig` is actually constructed today**

Search for the file that builds a `ClientConfig` instance (service, not the DTO) and read it in full before editing — this plan deliberately does not assume its exact shape since it wasn't part of the earlier research pass.

- [ ] **Step 2: Add the field to the entity/DTO**

```ts
// in client-config.entity.ts, alongside the other @Field(() => Boolean) entries
@Field(() => WorkspacePlanTier, { nullable: true })
currentWorkspacePlanTier?: WorkspacePlanTier;
```

Add the import and a `registerEnumType(WorkspacePlanTier, { name: 'WorkspacePlanTier' })` call near the file's other `registerEnumType` calls.

- [ ] **Step 3: Populate the field in the building service**

Call `workspacePlanTierService.getWorkspacePlanTier(workspaceId)` where the service already has the current workspace id available (it must, since other workspace-scoped fields exist), and assign the result. If the service that builds `ClientConfig` runs in a context where there is no current workspace (public/unauthenticated), leave the field `undefined` rather than throwing.

- [ ] **Step 4: Regenerate frontend GraphQL types**

Run: `npx nx run asturian-front:graphql:generate`
Expected: succeeds, and the generated types now include `currentWorkspacePlanTier` on the `ClientConfig` type.

- [ ] **Step 5: Run the existing client-config test suite**

Run: `cd packages/zyra-server && npx jest client-config`
Expected: PASS (extend the existing spec with one case asserting the new field is populated, using the same mocking style already used in that file for other service dependencies)

- [ ] **Step 6: Commit**

```bash
git add packages/zyra-server/src/engine/core-modules/client-config packages/asturian-front/src/generated-metadata packages/asturian-front/src/generated
git commit -m "feat(server): expoe currentWorkspacePlanTier no ClientConfig"
```

---

### Task 6: Grandfather backfill workspace command

**Files:**
- Create (generated): a workspace command under `packages/zyra-server/src/database/commands/` (exact path assigned by whatever generator/convention existing workspace commands use — find one existing `@RegisteredWorkspaceCommand` file first and mirror its location, since `UPGRADE_COMMANDS.md` doesn't show a generator for this type, only instance commands)
- Test: a `.spec.ts` alongside it, matching whatever test convention existing workspace commands use (read one first).

**Interfaces:**
- Consumes: `WorkspacePlanGrandfatherEntity` repository (Task 1). Record-lookup services for: `ConnectedAccountEntity` (WhatsApp/Instagram), voice agent config entity (find its exact name — it's under `engine/metadata-modules/voice-agent/entities/`), `Workflow` standard object records (via `FindRecordsService`, `objectName: 'workflow'`), and `ObjectMetadata` entities with `isCustom: true` (find the exact repository/service — grep `object-metadata.entity.ts` for an `isCustom` or similar column name and confirm before writing the check).

- [ ] **Step 1: Find and read one existing workspace command in full**

Locate any file already decorated `@RegisteredWorkspaceCommand` (CLAUDE.md and `UPGRADE_COMMANDS.md` both reference the pattern but the example in the docs is illustrative, not a real file — find a real one in `packages/zyra-server/src/database/commands/` and copy its exact file location convention, constructor-injection style, and `RunOnWorkspaceArgs` shape).

- [ ] **Step 2: Write the command**

```ts
@RegisteredWorkspaceCommand('1.XX.0', <next-available-timestamp>)
@Command({
  name: 'upgrade:plan-tier:grandfather-existing-feature-usage',
  description:
    'Grants PRO plan-tier access to workspaces already using a now-gated feature (WhatsApp, Instagram, Voice Agent, Workflows, or custom objects) before plan-tier gating existed',
})
export class GrandfatherExistingFeatureUsageCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(WorkspacePlanGrandfatherEntity)
    private readonly grandfatherRepository: Repository<WorkspacePlanGrandfatherEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly findRecordsService: FindRecordsService,
    // add whatever repository/service Step 1's real example shows is the
    // correct way to query a standard/custom object's records and metadata
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const alreadyGrandfathered = await this.grandfatherRepository.findOne({
      where: { workspaceId },
    });

    if (isDefined(alreadyGrandfathered)) {
      return;
    }

    const hasGatedUsage = await this.workspaceHasGatedFeatureUsage(workspaceId);

    if (!hasGatedUsage) {
      return;
    }

    if (options.dryRun) {
      return;
    }

    await this.grandfatherRepository.insert({
      workspaceId,
      reason: 'Pre-existing usage of a now plan-gated feature at rollout time',
    });
  }

  private async workspaceHasGatedFeatureUsage(
    workspaceId: string,
  ): Promise<boolean> {
    const connectedWhatsappOrInstagram = await this.connectedAccountRepository.findOne({
      where: [
        { workspaceId, provider: 'whatsapp' },
        { workspaceId, provider: 'instagram' },
      ],
    });

    if (isDefined(connectedWhatsappOrInstagram)) {
      return true;
    }

    // Fill in the remaining three checks (voice agent config, any workflow
    // record, any custom object-metadata row) using whatever repository/
    // service Step 1 showed is the real pattern for querying each — do not
    // leave these as placeholders; this method must be complete before Step 3.

    return false;
  }
}
```

Note for the implementer: the `provider: 'whatsapp' | 'instagram'` filter above is a guess at `ConnectedAccountEntity`'s actual column/enum — confirm the real column name and value by reading `connected-account.entity.ts` and correct this before running.

- [ ] **Step 3: Write a unit test exercising the gating logic**

```ts
// alongside the command file, matching the existing workspace-command test convention found in Step 1
describe('GrandfatherExistingFeatureUsageCommand', () => {
  it('grandfathers a workspace with a connected WhatsApp account', async () => {
    // arrange: mock connectedAccountRepository.findOne to resolve a row
    // act: call runOnWorkspace({ workspaceId: 'workspace-1', options: { dryRun: false } })
    // assert: grandfatherRepository.insert was called with workspaceId: 'workspace-1'
  });

  it('does not grandfather a workspace with no gated-feature usage', async () => {
    // arrange: every lookup mocked to resolve null/empty
    // act + assert: grandfatherRepository.insert was NOT called
  });

  it('is idempotent — does nothing if already grandfathered', async () => {
    // arrange: grandfatherRepository.findOne resolves an existing row
    // act + assert: no further lookups performed, insert not called
  });

  it('does nothing in dry-run mode even with gated usage found', async () => {
    // arrange: a gated-usage check resolves true, options.dryRun = true
    // act + assert: insert not called
  });
});
```

Fill in each test body following whatever mocking style Step 1's real example test uses (NestJS testing module vs plain manual instantiation) — this plan intentionally leaves the exact harness to match the codebase's existing convention rather than inventing a new one.

- [ ] **Step 4: Run the test**

Run: `cd packages/zyra-server && npx jest grandfather-existing-feature-usage`
Expected: PASS

- [ ] **Step 5: Dry-run against the local dev database**

Run: `npx nx run zyra-server:command -- upgrade:plan-tier:grandfather-existing-feature-usage --dry-run --verbose`
Expected: completes without error; inspect logged output for which workspaces would be grandfathered.

- [ ] **Step 6: Commit**

```bash
git add packages/zyra-server/src/database/commands
git commit -m "feat(server): workspace command para grandfather de workspaces com uso previo"
```

---

### Task 7: Frontend `useWorkspacePlanTier` hook

**Files:**
- Create: `packages/asturian-front/src/modules/workspace/hooks/useWorkspacePlanTier.ts`
- Test: `packages/asturian-front/src/modules/workspace/hooks/__tests__/useWorkspacePlanTier.test.ts`

**Interfaces:**
- Consumes: the regenerated `ClientConfig.currentWorkspacePlanTier` field (Task 5) via whatever hook already reads `ClientConfig` on the frontend (find it — likely `useClientConfig` or similar; grep for `clientConfig` usage in `asturian-front/src/modules` and read one real consumer before writing this hook).
- Produces: `useWorkspacePlanTier(): { planTier: WorkspacePlanTier | undefined; isBasicTier: boolean; isProTier: boolean }`.

- [ ] **Step 1: Find the existing ClientConfig-reading hook**

Grep `asturian-front/src/modules` for the hook that already exposes other `ClientConfig` fields to components (e.g. whatever powers `isWhatsappMessagingEnabled` checks today) and read it in full.

- [ ] **Step 2: Write the failing test**

```ts
// packages/asturian-front/src/modules/workspace/hooks/__tests__/useWorkspacePlanTier.test.ts
import { renderHook } from '@testing-library/react';

import { useWorkspacePlanTier } from '@/workspace/hooks/useWorkspacePlanTier';

// Mock whatever the real underlying ClientConfig hook from Step 1 turns out
// to be, returning { currentWorkspacePlanTier: 'BASIC' } then 'PRO' across
// two test cases.

describe('useWorkspacePlanTier', () => {
  it('reports isBasicTier when the workspace is on BASIC', () => {
    const { result } = renderHook(() => useWorkspacePlanTier());

    expect(result.current.isBasicTier).toBe(true);
    expect(result.current.isProTier).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/asturian-front && npx jest useWorkspacePlanTier`
Expected: FAIL — module not found

- [ ] **Step 4: Write the implementation**

```ts
// packages/asturian-front/src/modules/workspace/hooks/useWorkspacePlanTier.ts
import { WorkspacePlanTier } from '~/generated-metadata/graphql'; // adjust to the real generated-types import path found in Step 1

export const useWorkspacePlanTier = () => {
  // Replace this body with a call into whatever hook Step 1 identified —
  // this plan only fixes the public shape, not the underlying data source.
  const planTier = undefined as WorkspacePlanTier | undefined;

  return {
    planTier,
    isBasicTier: planTier === WorkspacePlanTier.Basic,
    isProTier: planTier === WorkspacePlanTier.Pro,
  };
};
```

The implementer must replace the `planTier` placeholder line with a real call to the Step 1 hook — this is the one line in this entire plan whose exact code can't be fixed in advance because it depends on Step 1's findings; everything else is concrete.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/asturian-front && npx jest useWorkspacePlanTier`
Expected: PASS

- [ ] **Step 6: Lint and typecheck**

Run: `npx nx lint:diff-with-main asturian-front` then `npx oxlint --type-aware packages/asturian-front/src/modules/workspace/hooks/useWorkspacePlanTier.ts` (full `nx typecheck` is known to OOM on this package — see project memory — use `oxlint --type-aware` on the changed files instead)

- [ ] **Step 7: Commit**

```bash
git add packages/asturian-front/src/modules/workspace/hooks
git commit -m "feat(front): hook useWorkspacePlanTier"
```

---

### Task 8: Nav filtering + upsell page

**Files:**
- Modify: `packages/asturian-front/src/modules/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems.ts`
- Modify: its existing test file `packages/asturian-front/src/modules/navigation-menu-item/common/utils/__tests__/filterWorkspaceNavigationMenuItems.test.ts`
- Create: `packages/asturian-front/src/pages/settings/plan/SettingsUpgradeToProPage.tsx`
- Modify: `packages/asturian-front/src/modules/app/components/SettingsRoutes.tsx` (add one route)
- Modify: wherever the settings nav list is built (find it by searching for how `SettingsPath.Funnel` gets a nav entry — likely a nav-items constants file under `modules/navigation` or `modules/settings`)
- Modify: `zyra-shared/src/types` (or wherever `SettingsPath` enum lives) to add `SettingsPath.UpgradeToPro`

**Interfaces:**
- Consumes: `useWorkspacePlanTier` (Task 7).
- Produces: `isNavigationMenuItemGatedByPlan(item): boolean` helper used inside `filterWorkspaceNavigationMenuItems`.

- [ ] **Step 1: Read the current filter function and its test file in full**

Both are small (the function is a one-line filter per research) — read them completely before editing.

- [ ] **Step 2: Write a new failing test case in the existing test file**

Add a case to the existing `describe` block (matching its current style exactly — do not restructure the file) asserting that an item pointing at a gated settings page (e.g. mock an item whose computed link is the WhatsApp settings path) is excluded when `isBasicTier` is true, and included when `isBasicTier` is false. Read the existing tests' fixture shape first and reuse it rather than inventing a new one.

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd packages/asturian-front && npx jest filterWorkspaceNavigationMenuItems`
Expected: FAIL on the new case only

- [ ] **Step 4: Extend the filter function**

Add a parameter (or read `useWorkspacePlanTier` at the call site and pass `isBasicTier` in, matching whichever is more consistent with how the function is already invoked — it may be a pure function taking data in, in which case thread `isBasicTier: boolean` through as a parameter rather than calling the hook inside a non-component util):

```ts
const PLAN_GATED_SETTINGS_PATHS: ReadonlySet<string> = new Set([
  SettingsPath.AccountsWhatsapp,
  SettingsPath.AccountsInstagram,
  SettingsPath.AccountsVoiceAgent,
  // add the Workflows and custom-objects nav identifiers once their real
  // SettingsPath / object-metadata nav-item shape is confirmed by reading
  // how those items currently appear in the nav data structure
]);

const isNavigationMenuItemGatedByPlan = (item: FlatNavigationMenuItem): boolean =>
  PLAN_GATED_SETTINGS_PATHS.has(item.link ?? '');
```

Wire this into the existing filter so a gated item is dropped when `isBasicTier` is true — place the new check alongside the existing `userWorkspaceId` check, following that function's current structure exactly (read it first, this plan doesn't repeat its current body since editing it requires seeing the real one).

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd packages/asturian-front && npx jest filterWorkspaceNavigationMenuItems`
Expected: PASS

- [ ] **Step 6: Add the `SettingsPath.UpgradeToPro` enum member**

Find `SettingsPath` in `zyra-shared/src/types` (or wherever it actually lives — confirmed via the `SettingsRoutes.tsx` import in research) and add one new member, following the existing naming convention exactly.

- [ ] **Step 7: Write the upsell page**

```tsx
// packages/asturian-front/src/pages/settings/plan/SettingsUpgradeToProPage.tsx
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';

export const SettingsUpgradeToProPage = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Recursos Pro`}
      links={[{ children: t`Workspace` }, { children: t`Recursos Pro` }]}
    >
      <SettingsPageContainer>
        <p>
          {t`WhatsApp, Instagram, Voice Agent, Workflows e objetos personalizados fazem parte do plano Pro. Fale com o suporte para fazer upgrade do seu workspace.`}
        </p>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
```

- [ ] **Step 8: Register the route**

In `SettingsRoutes.tsx`, add `<Route path={SettingsPath.UpgradeToPro} element={<SettingsUpgradeToProPage />} />` next to the other top-level settings routes (e.g. beside `SettingsPath.Funnel`), following that file's existing grouping.

- [ ] **Step 9: Add the single nav entry for BASIC-tier workspaces**

Find where the settings nav sections/items are statically defined (not the dynamic `navigation-menu-item` system — this is the Settings sidebar specifically) and add one entry pointing at `SettingsPath.UpgradeToPro`, rendered conditionally on `useWorkspacePlanTier().isBasicTier`. Read that file first; it was not part of the research pass, so its exact shape must be confirmed before editing.

- [ ] **Step 10: Lint and typecheck**

Run: `npx nx lint:diff-with-main asturian-front` then `npx oxlint --type-aware` on every file touched in this task.

- [ ] **Step 11: Commit**

```bash
git add packages/asturian-front/src/modules/navigation-menu-item packages/asturian-front/src/pages/settings/plan packages/asturian-front/src/modules/app/components/SettingsRoutes.tsx
git commit -m "feat(front): oculta itens gated no nav para tier BASIC e adiciona pagina de upgrade"
```

---

## Self-review notes (already applied above)

- Every task ends with a runnable test and a commit.
- Tasks 4, 6, 7 (Step 4), and 8 (Steps 4/9) contain explicit "read the real file first, this plan can't guess its exact current shape" instructions rather than fabricated guesses presented as fact — flagged inline rather than hidden, per the spec's emphasis on not inventing unverified specifics. This is intentional: the research pass that grounded this plan did not open every file involved (some, like the settings nav sidebar data and the `ClientConfig`-building service, were explicitly out of scope of that pass). An implementer following subagent-driven-development will read those files as the very first step of the task, which is standard practice, not a gap.
- Spec coverage: plan-tier enum/service/guard (Tasks 1-3), all 5 gating points (Task 4), GraphQL exposure (Task 5), grandfathering (Task 6), frontend hook (Task 7), nav hiding + upsell discovery path (Task 8) — every "Design — Plan-tier gating" bullet in the spec has a task.
