import { Injectable, NotFoundException } from '@nestjs/common';

import { FunnelPageStatus } from 'zyra-shared/types';

import { CreateFunnelLeadInput } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-lead.input';
import { CreateFunnelPageInput } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-page.input';
import { UpdateFunnelPageInput } from 'src/engine/metadata-modules/funnel-page/dtos/update-funnel-page.input';
import { FunnelLeadEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-lead.entity';
import { FunnelPageEntity } from 'src/engine/metadata-modules/funnel-page/entities/funnel-page.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class FunnelPageMetadataService {
  constructor(
    @InjectWorkspaceScopedRepository(FunnelPageEntity)
    private readonly funnelPageRepository: WorkspaceScopedRepository<FunnelPageEntity>,
    @InjectWorkspaceScopedRepository(FunnelLeadEntity)
    private readonly funnelLeadRepository: WorkspaceScopedRepository<FunnelLeadEntity>,
  ) {}

  async findAllForWorkspace(workspaceId: string): Promise<FunnelPageEntity[]> {
    return this.funnelPageRepository.find(workspaceId, {
      order: { createdAt: 'ASC' },
    });
  }

  async findOneForWorkspace({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FunnelPageEntity> {
    const funnelPage = await this.funnelPageRepository.findOne(workspaceId, {
      where: { id },
    });

    if (!funnelPage) {
      throw new NotFoundException('Funnel page not found');
    }

    return funnelPage;
  }

  async create({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateFunnelPageInput;
  }): Promise<FunnelPageEntity> {
    return this.funnelPageRepository.save(workspaceId, {
      ...input,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    });
  }

  async update({
    id,
    workspaceId,
    input,
  }: {
    id: string;
    workspaceId: string;
    input: UpdateFunnelPageInput;
  }): Promise<FunnelPageEntity> {
    const funnelPage = await this.findOneForWorkspace({ id, workspaceId });

    const { id: _inputId, ...updatableFields } = input;

    const definedFields = Object.fromEntries(
      Object.entries(updatableFields).filter(([, value]) => value !== undefined),
    );

    await this.funnelPageRepository.update(workspaceId, { id }, definedFields);

    return { ...funnelPage, ...definedFields };
  }

  async publish({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FunnelPageEntity> {
    const funnelPage = await this.findOneForWorkspace({ id, workspaceId });

    await this.funnelPageRepository.update(
      workspaceId,
      { id },
      { status: FunnelPageStatus.PUBLISHED },
    );

    return { ...funnelPage, status: FunnelPageStatus.PUBLISHED };
  }

  async unpublish({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FunnelPageEntity> {
    const funnelPage = await this.findOneForWorkspace({ id, workspaceId });

    await this.funnelPageRepository.update(
      workspaceId,
      { id },
      { status: FunnelPageStatus.DRAFT },
    );

    return { ...funnelPage, status: FunnelPageStatus.DRAFT };
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    await this.findOneForWorkspace({ id, workspaceId });

    await this.funnelPageRepository.delete(workspaceId, { id });

    return true;
  }

  // Public read path — no auth context, used by the unauthenticated funnel
  // controller that serves the live page to visitors. Only ever returns
  // published pages: drafts must stay invisible to the public internet.
  async findPublishedBySlug({
    workspaceId,
    slug,
  }: {
    workspaceId: string;
    slug: string;
  }): Promise<FunnelPageEntity | null> {
    const funnelPage = await this.funnelPageRepository.findOne(workspaceId, {
      where: { slug },
    });

    if (!funnelPage || funnelPage.status !== FunnelPageStatus.PUBLISHED) {
      return null;
    }

    return funnelPage;
  }

  // Public write path — validates the target page belongs to the workspace
  // in the URL before inserting, so a caller can't inject a lead against a
  // funnelPageId from a different workspace by guessing/reusing an id.
  async createLead({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateFunnelLeadInput;
  }): Promise<FunnelLeadEntity> {
    const funnelPage = await this.funnelPageRepository.findOne(workspaceId, {
      where: { id: input.funnelPageId },
    });

    if (!funnelPage) {
      throw new NotFoundException('Funnel page not found for this workspace');
    }

    return this.funnelLeadRepository.save(workspaceId, {
      funnelPageId: input.funnelPageId,
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
    });
  }
}
