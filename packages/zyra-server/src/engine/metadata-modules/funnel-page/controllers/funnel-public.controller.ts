import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateFunnelLeadBodyDto } from 'src/engine/metadata-modules/funnel-page/dtos/create-funnel-lead-body.dto';
import { FunnelPageMetadataService } from 'src/engine/metadata-modules/funnel-page/funnel-page-metadata.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fully public, unauthenticated surface: serves the live (published-only)
// funnel pages that visitors land on, and captures the lead-form
// submissions from those pages. No WorkspaceAuthGuard — the workspace is
// identified by id in the URL instead of an auth session, since visitors
// have none. PublicEndpointGuard/NoPermissionGuard are no-op markers (same
// convention as UnsubscribeController) documenting that intentionally.
@Controller('funnel')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class FunnelPublicController {
  constructor(
    private readonly funnelPageMetadataService: FunnelPageMetadataService,
  ) {}

  @Get(':workspaceId/:slug')
  async getPublishedPage(
    @Param('workspaceId') workspaceId: string,
    @Param('slug') slug: string,
  ): Promise<{
    id: string;
    type: string;
    content: unknown;
    seoTitle: string | null;
    seoDescription: string | null;
  }> {
    this.assertValidUuid(workspaceId, 'workspace id');

    const funnelPage = await this.funnelPageMetadataService.findPublishedBySlug(
      { workspaceId, slug },
    );

    if (!funnelPage) {
      throw new NotFoundException('Funnel page not found');
    }

    return {
      // Needed by the signup page's lead-capture form (POST .../leads takes
      // funnelPageId) — the public read side must expose it even though
      // nothing else here is workspace-internal.
      id: funnelPage.id,
      type: funnelPage.type,
      content: funnelPage.content,
      seoTitle: funnelPage.seoTitle,
      seoDescription: funnelPage.seoDescription,
    };
  }

  @Post(':workspaceId/leads')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createLead(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateFunnelLeadBodyDto,
  ): Promise<{ success: true; leadId: string }> {
    this.assertValidUuid(workspaceId, 'workspace id');

    const funnelLead = await this.funnelPageMetadataService.createLead({
      workspaceId,
      input: {
        funnelPageId: body.funnelPageId,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        whatsapp: body.whatsapp.trim(),
        utmSource: body.utmSource?.trim(),
        utmMedium: body.utmMedium?.trim(),
        utmCampaign: body.utmCampaign?.trim(),
      },
    });

    return { success: true, leadId: funnelLead.id };
  }

  @Post(':workspaceId/leads/:leadId/attended')
  async markLeadAsAttendee(
    @Param('workspaceId') workspaceId: string,
    @Param('leadId') leadId: string,
  ): Promise<{ success: true }> {
    this.assertValidUuid(workspaceId, 'workspace id');
    this.assertValidUuid(leadId, 'lead id');

    await this.funnelPageMetadataService.markLeadAsAttendee({
      workspaceId,
      leadId,
    });

    return { success: true };
  }

  private assertValidUuid(value: string, label: string): void {
    if (!UUID_FORMAT.test(value)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
  }
}
