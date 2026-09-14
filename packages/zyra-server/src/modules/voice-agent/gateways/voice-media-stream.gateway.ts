import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { type IncomingMessage, type Server as HttpServer } from 'http';
import { type Duplex } from 'stream';

import { Repository } from 'typeorm';
import { isDefined } from 'zyra-shared/utils';
import { WebSocket, WebSocketServer } from 'ws';

import { VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceRealtimeBridgeService } from 'src/modules/voice-agent/services/voice-realtime-bridge.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';

export const VOICE_MEDIA_STREAM_PATH = '/voice-agent/media-stream';

// Twilio Media Streams speaks plain WebSocket, not Socket.io/graphql-ws, so
// using @nestjs/websockets here would mean adding a platform adapter that
// isn't installed and that would take over ALL WebSocket upgrades for the
// whole app. Instead this attaches a bare `ws` WebSocketServer directly to
// Nest's underlying HTTP server (once, on bootstrap) and only intercepts
// upgrade requests for VOICE_MEDIA_STREAM_PATH — every other upgrade request
// falls through untouched, which today means "left unhandled", since nothing
// else in this app currently listens on the HTTP server's 'upgrade' event
// (GraphQL subscriptions run over SSE, not raw WebSocket). If that ever
// changes, this handler must keep ignoring paths it doesn't own rather than
// consuming the socket.
@Injectable()
export class VoiceMediaStreamGateway implements OnApplicationBootstrap {
  private readonly logger = new Logger(VoiceMediaStreamGateway.name);
  private readonly webSocketServer = new WebSocketServer({ noServer: true });

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly voiceRealtimeBridgeService: VoiceRealtimeBridgeService,
    // Twilio's WS upgrade URL only carries voiceCallId — the workspace is
    // only known once this lookup resolves, so it can't be scoped up front.
    // eslint-disable-next-line zyra/prefer-workspace-scoped-repository
    @InjectRepository(VoiceCallEntity)
    private readonly voiceCallRepository: Repository<VoiceCallEntity>,
    @InjectWorkspaceScopedRepository(VoiceAgentEntity)
    private readonly voiceAgentRepository: WorkspaceScopedRepository<VoiceAgentEntity>,
  ) {}

  onApplicationBootstrap(): void {
    const httpServer = this.httpAdapterHost.httpAdapter?.getHttpServer() as
      | HttpServer
      | undefined;

    if (!isDefined(httpServer)) {
      // Expected in non-web bootstrap contexts (CLI commands, the worker
      // process) — they load the full Nest app but never start an HTTP
      // listener, so there's nothing to attach the upgrade handler to.
      this.logger.warn(
        'No HTTP server available to attach the voice media-stream WebSocket to',
      );

      return;
    }

    httpServer.on(
      'upgrade',
      (request: IncomingMessage, socket: Duplex, head: Buffer) => {
        const { pathname, searchParams } = new URL(
          request.url ?? '',
          'http://localhost',
        );

        if (pathname !== VOICE_MEDIA_STREAM_PATH) {
          return;
        }

        this.webSocketServer.handleUpgrade(
          request,
          socket,
          head,
          (twilioSocket) => {
            this.handleTwilioConnection(
              twilioSocket,
              searchParams.get('voiceCallId'),
            ).catch((error: unknown) => {
              this.logger.error(
                'Failed to handle incoming voice media-stream connection',
                error instanceof Error ? error.stack : String(error),
              );
              twilioSocket.close();
            });
          },
        );
      },
    );

    this.logger.log(
      `Voice media-stream WebSocket listening on ${VOICE_MEDIA_STREAM_PATH}`,
    );
  }

  private async handleTwilioConnection(
    twilioSocket: WebSocket,
    voiceCallId: string | null,
  ): Promise<void> {
    if (!isDefined(voiceCallId)) {
      this.logger.warn(
        'Voice media-stream connection is missing voiceCallId — closing',
      );
      twilioSocket.close();

      return;
    }

    const voiceCall = await this.voiceCallRepository.findOne({
      where: { id: voiceCallId },
    });

    if (!isDefined(voiceCall)) {
      this.logger.warn(
        `Voice media-stream connection references unknown voice call ${voiceCallId}`,
      );
      twilioSocket.close();

      return;
    }

    const voiceAgent = await this.voiceAgentRepository.findOne(
      voiceCall.workspaceId,
      { where: { id: voiceCall.voiceAgentId } },
    );

    if (!isDefined(voiceAgent)) {
      this.logger.error(
        `Voice call ${voiceCall.id} references missing voice agent ${voiceCall.voiceAgentId}`,
      );
      twilioSocket.close();

      return;
    }

    this.voiceRealtimeBridgeService.attach(twilioSocket, voiceCall, voiceAgent);
  }
}
