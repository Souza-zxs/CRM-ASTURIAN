import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';
import { WhatsappTemplateStatus } from 'zyra-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { WhatsappChannelEntity } from 'src/engine/metadata-modules/whatsapp-channel/entities/whatsapp-channel.entity';
import { type CreateWhatsappTemplateInput } from 'src/engine/metadata-modules/whatsapp-template/dtos/create-whatsapp-template.input';
import { type UpdateWhatsappTemplateInput } from 'src/engine/metadata-modules/whatsapp-template/dtos/update-whatsapp-template.input';
import { WhatsappTemplateEntity } from 'src/engine/metadata-modules/whatsapp-template/entities/whatsapp-template.entity';
import {
  type CreateWhatsappTemplatePayload,
  type WhatsappTemplateComponent,
  WhatsappGraphApiService,
} from 'src/modules/whatsapp/services/whatsapp-graph-api.service';
import {
  WhatsappException,
  WhatsappExceptionCode,
} from 'src/modules/whatsapp/types/whatsapp.exception';

const buildTemplateComponents = (
  template: Pick<
    WhatsappTemplateEntity,
    'headerText' | 'bodyText' | 'footerText' | 'buttons'
  >,
): WhatsappTemplateComponent[] => {
  const components: WhatsappTemplateComponent[] = [
    { type: 'BODY', text: template.bodyText },
  ];

  if (isDefined(template.headerText) && template.headerText.length > 0) {
    components.push({
      type: 'HEADER',
      format: 'TEXT',
      text: template.headerText,
    });
  }

  if (isDefined(template.footerText) && template.footerText.length > 0) {
    components.push({ type: 'FOOTER', text: template.footerText });
  }

  if (isDefined(template.buttons) && template.buttons.length > 0) {
    components.push({
      type: 'BUTTONS',
      buttons: template.buttons.map((button) => {
        if (button.type === 'URL') {
          return { type: 'URL', text: button.text, url: button.url ?? '' };
        }

        if (button.type === 'PHONE_NUMBER') {
          return {
            type: 'PHONE_NUMBER',
            text: button.text,
            phone_number: button.phoneNumber ?? '',
          };
        }

        return { type: 'QUICK_REPLY', text: button.text };
      }),
    });
  }

  return components;
};

@Injectable()
export class WhatsappTemplateMetadataService {
  constructor(
    @InjectRepository(WhatsappTemplateEntity)
    private readonly whatsappTemplateRepository: Repository<WhatsappTemplateEntity>,
    @InjectRepository(WhatsappChannelEntity)
    private readonly whatsappChannelRepository: Repository<WhatsappChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly whatsappGraphApiService: WhatsappGraphApiService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async findAllForWorkspace(workspaceId: string): Promise<
    WhatsappTemplateEntity[]
  > {
    return this.whatsappTemplateRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForWorkspaceOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsappTemplateEntity> {
    const template = await this.whatsappTemplateRepository.findOne({
      where: { id, workspaceId },
    });

    if (!isDefined(template)) {
      throw new WhatsappException(
        `WhatsApp template ${id} not found`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_NOT_FOUND,
      );
    }

    return template;
  }

  async create({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateWhatsappTemplateInput;
  }): Promise<WhatsappTemplateEntity> {
    const channel = await this.whatsappChannelRepository.findOne({
      where: { id: input.whatsappChannelId, workspaceId },
    });

    if (!isDefined(channel)) {
      throw new WhatsappException(
        `WhatsApp channel ${input.whatsappChannelId} not found`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    const template = this.whatsappTemplateRepository.create({
      workspaceId,
      whatsappChannelId: input.whatsappChannelId,
      name: input.name,
      category: input.category,
      language: input.language,
      headerText: input.headerText ?? null,
      bodyText: input.bodyText,
      footerText: input.footerText ?? null,
      buttons: input.buttons ?? null,
      status: WhatsappTemplateStatus.DRAFT,
    });

    return this.whatsappTemplateRepository.save(template);
  }

  // Only DRAFT/REJECTED templates can be edited — once a template is
  // PENDING/APPROVED at Meta, its content is immutable there (Meta requires
  // creating a new template to change approved copy), so editing the local
  // row would silently desync it from what's actually usable for sending.
  async update({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpdateWhatsappTemplateInput;
  }): Promise<WhatsappTemplateEntity> {
    const template = await this.findOneForWorkspaceOrThrow({
      id: input.id,
      workspaceId,
    });

    if (
      template.status !== WhatsappTemplateStatus.DRAFT &&
      template.status !== WhatsappTemplateStatus.REJECTED
    ) {
      throw new WhatsappException(
        `WhatsApp template ${input.id} can no longer be edited (status ${template.status})`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_CREATE_FAILED,
      );
    }

    Object.assign(template, {
      ...(isDefined(input.name) ? { name: input.name } : {}),
      ...(isDefined(input.category) ? { category: input.category } : {}),
      ...(isDefined(input.language) ? { language: input.language } : {}),
      ...(input.headerText !== undefined
        ? { headerText: input.headerText }
        : {}),
      ...(isDefined(input.bodyText) ? { bodyText: input.bodyText } : {}),
      ...(input.footerText !== undefined
        ? { footerText: input.footerText }
        : {}),
      ...(input.buttons !== undefined ? { buttons: input.buttons } : {}),
      status: WhatsappTemplateStatus.DRAFT,
      metaTemplateId: null,
      metaTemplateStatus: null,
      rejectionReason: null,
    });

    return this.whatsappTemplateRepository.save(template);
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    await this.findOneForWorkspaceOrThrow({ id, workspaceId });
    await this.whatsappTemplateRepository.delete({ id, workspaceId });

    return true;
  }

  private async getChannelAccessToken(
    channel: WhatsappChannelEntity,
  ): Promise<string> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: channel.connectedAccountId },
    });

    if (!isDefined(connectedAccount) || !isDefined(connectedAccount.accessToken)) {
      throw new WhatsappException(
        `Connected account for WhatsApp channel ${channel.id} has no access token`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: connectedAccount.workspaceId,
    });
  }

  async submitForApproval({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsappTemplateEntity> {
    const template = await this.findOneForWorkspaceOrThrow({
      id,
      workspaceId,
    });

    if (
      template.status !== WhatsappTemplateStatus.DRAFT &&
      template.status !== WhatsappTemplateStatus.REJECTED
    ) {
      throw new WhatsappException(
        `WhatsApp template ${id} was already submitted (status ${template.status})`,
        WhatsappExceptionCode.WHATSAPP_TEMPLATE_SYNC_FAILED,
      );
    }

    const channel = await this.whatsappChannelRepository.findOne({
      where: { id: template.whatsappChannelId, workspaceId },
    });

    if (!isDefined(channel)) {
      throw new WhatsappException(
        `WhatsApp channel ${template.whatsappChannelId} not found`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    const accessToken = await this.getChannelAccessToken(channel);

    const payload: CreateWhatsappTemplatePayload = {
      name: template.name,
      category: template.category,
      language: template.language,
      components: buildTemplateComponents(template),
    };

    const { metaTemplateId } =
      await this.whatsappGraphApiService.createMessageTemplate(
        channel.wabaId,
        accessToken,
        payload,
      );

    template.metaTemplateId = metaTemplateId;
    template.status = WhatsappTemplateStatus.PENDING;
    template.metaTemplateStatus = 'PENDING';
    template.rejectionReason = null;

    return this.whatsappTemplateRepository.save(template);
  }

  async refreshStatus({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsappTemplateEntity> {
    const template = await this.findOneForWorkspaceOrThrow({
      id,
      workspaceId,
    });

    if (!isDefined(template.metaTemplateId)) {
      return template;
    }

    const channel = await this.whatsappChannelRepository.findOne({
      where: { id: template.whatsappChannelId, workspaceId },
    });

    if (!isDefined(channel)) {
      throw new WhatsappException(
        `WhatsApp channel ${template.whatsappChannelId} not found`,
        WhatsappExceptionCode.WHATSAPP_CHANNEL_NOT_FOUND,
      );
    }

    const accessToken = await this.getChannelAccessToken(channel);

    const remoteStatus = await this.whatsappGraphApiService.getMessageTemplateStatus(
      channel.wabaId,
      accessToken,
      template.metaTemplateId,
    );

    template.metaTemplateStatus = remoteStatus.status;
    template.rejectionReason = remoteStatus.rejectedReason ?? null;
    template.status =
      remoteStatus.status === 'APPROVED'
        ? WhatsappTemplateStatus.APPROVED
        : remoteStatus.status === 'REJECTED'
          ? WhatsappTemplateStatus.REJECTED
          : WhatsappTemplateStatus.PENDING;

    return this.whatsappTemplateRepository.save(template);
  }
}
