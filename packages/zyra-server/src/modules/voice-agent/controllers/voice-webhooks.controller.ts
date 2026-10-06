import {
  Controller,
  ForbiddenException,
  Header,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Request } from 'express';
import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';

import { PlanLimitService } from 'src/engine/core-modules/plan-tier/services/plan-limit.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceCallDirection } from 'src/engine/metadata-modules/voice-agent/types/voice-call-direction.enum';
import { VoiceCallStatus } from 'src/engine/metadata-modules/voice-agent/types/voice-call-status.enum';
import { TwilioSignatureVerifierService } from 'src/modules/voice-agent/services/twilio-signature-verifier.service';
import {
  type TwilioCallStatus,
  type TwilioIncomingCallWebhookBody,
  type TwilioStatusCallbackWebhookBody,
} from 'src/modules/voice-agent/types/twilio-voice-webhook-payload.type';

// Twilio call statuses that mean the call is over — anything else
// (queued/ringing/in-progress) is an intermediate status callback we ignore,
// since VoiceCallEntity is already IN_PROGRESS from the incoming webhook.
const TERMINAL_STATUS_BY_TWILIO_STATUS: Partial<
  Record<TwilioCallStatus, VoiceCallStatus>
> = {
  completed: VoiceCallStatus.COMPLETED,
  failed: VoiceCallStatus.FAILED,
  busy: VoiceCallStatus.FAILED,
  canceled: VoiceCallStatus.FAILED,
  'no-answer': VoiceCallStatus.NO_ANSWER,
};

@Controller('webhooks/voice')
export class VoiceWebhooksController {
  private readonly logger = new Logger(VoiceWebhooksController.name);

  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly twilioSignatureVerifierService: TwilioSignatureVerifierService,
    private readonly planLimitService: PlanLimitService,
    // Twilio's webhooks identify calls by phone number / CallSid, not
    // workspace — the workspace is only discovered by looking these up, so
    // these repositories can't be workspace-scoped up front.
    // eslint-disable-next-line zyra/prefer-workspace-scoped-repository
    @InjectRepository(VoiceAgentEntity)
    private readonly voiceAgentRepository: Repository<VoiceAgentEntity>,
    // eslint-disable-next-line zyra/prefer-workspace-scoped-repository
    @InjectRepository(VoiceCallEntity)
    private readonly voiceCallRepository: Repository<VoiceCallEntity>,
  ) {}

  // Twilio's "voice URL" webhook — called the moment someone dials a number
  // assigned to a voice agent. Must respond with TwiML synchronously.
  @Post('incoming')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async handleIncomingCall(@Req() request: Request): Promise<string> {
    this.assertValidSignature(request, '/webhooks/voice/incoming');

    const body = request.body as TwilioIncomingCallWebhookBody;

    const voiceAgent = await this.voiceAgentRepository.findOne({
      where: { phoneNumber: body.To, isActive: true },
    });

    if (!isDefined(voiceAgent)) {
      return this.buildUnavailableTwiml();
    }

    const voiceCall = await this.voiceCallRepository.save({
      workspaceId: voiceAgent.workspaceId,
      voiceAgentId: voiceAgent.id,
      twilioCallSid: body.CallSid,
      direction: VoiceCallDirection.INBOUND,
      status: VoiceCallStatus.IN_PROGRESS,
      fromNumber: body.From,
      toNumber: body.To,
      startedAt: new Date(),
    });

    const streamUrl = `${this.getWebSocketBaseUrl()}/voice-agent/media-stream?voiceCallId=${voiceCall.id}`;

    return `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${streamUrl}" /></Connect></Response>`;
  }

  // Twilio's "status callback" webhook — fired on call state changes
  // (queued/ringing/in-progress/completed/...). No response body expected.
  @Post('status')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleStatusCallback(@Req() request: Request): Promise<void> {
    this.assertValidSignature(request, '/webhooks/voice/status');

    const body = request.body as TwilioStatusCallbackWebhookBody;
    const terminalStatus = TERMINAL_STATUS_BY_TWILIO_STATUS[body.CallStatus];

    if (!terminalStatus) {
      return;
    }

    const voiceCall = await this.voiceCallRepository.findOne({
      where: { twilioCallSid: body.CallSid },
    });

    if (!isDefined(voiceCall)) {
      return;
    }

    await this.voiceCallRepository.update(voiceCall.id, {
      status: terminalStatus,
      endedAt: voiceCall.endedAt ?? new Date(),
      durationSeconds: isDefined(body.CallDuration)
        ? Number(body.CallDuration)
        : voiceCall.durationSeconds,
      recordingUrl: body.RecordingUrl ?? voiceCall.recordingUrl,
    });

    await this.logIfMonthlyVoiceMinutesLimitExceeded(voiceCall.workspaceId);
  }

  // Soft log only, same reasoning as maxAIMessagesMonthly — this fires
  // after a call has already ended (Twilio's status callback), so there is
  // nothing left to block. It exists purely so overage is visible in logs
  // for ops/billing follow-up. Denying a *new* call before it connects is a
  // real option for later (see the spec's "fora de escopo") but isn't this.
  private async logIfMonthlyVoiceMinutesLimitExceeded(
    workspaceId: string,
  ): Promise<void> {
    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { sum } = (await this.voiceCallRepository
      .createQueryBuilder('voiceCall')
      .select('SUM(voiceCall.durationSeconds)', 'sum')
      .where('voiceCall.workspaceId = :workspaceId', { workspaceId })
      .andWhere('voiceCall.createdAt >= :startOfMonth', { startOfMonth })
      .getRawOne()) ?? { sum: 0 };

    const monthlyMinutesUsed = Math.floor(Number(sum ?? 0) / 60);
    const monthlyMinutesLimit = await this.planLimitService.resolveLimit(
      workspaceId,
      'maxVoiceMinutesMonthly',
    );

    if (monthlyMinutesUsed >= monthlyMinutesLimit) {
      this.logger.warn(
        `Workspace ${workspaceId} is over its monthly voice minutes limit (${monthlyMinutesUsed}/${monthlyMinutesLimit} min) — contract an additional module or follow up for overage billing`,
      );
    }
  }

  private assertValidSignature(request: Request, path: string): void {
    const url = `${this.getPublicHttpBaseUrl()}${path}`;
    const signatureHeader = request.headers['x-twilio-signature'] as
      | string
      | undefined;

    const isValid = this.twilioSignatureVerifierService.isValid({
      url,
      params: request.body as Record<string, string>,
      signatureHeader,
    });

    if (!isValid) {
      throw new ForbiddenException('Assinatura do webhook do Twilio inválida.');
    }
  }

  private getPublicHttpBaseUrl(): string {
    const configuredBaseUrl = this.zyraConfigService.get(
      'VOICE_AGENT_WEBHOOK_BASE_URL',
    );
    const baseUrl =
      configuredBaseUrl || this.zyraConfigService.get('SERVER_URL');

    return baseUrl.replace(/\/+$/, '');
  }

  private getWebSocketBaseUrl(): string {
    return this.getPublicHttpBaseUrl().replace(/^http/, 'ws');
  }

  private buildUnavailableTwiml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="pt-BR">No momento não há nenhum atendente disponível para esta linha. Por favor, tente novamente mais tarde.</Say><Hangup/></Response>`;
  }
}
