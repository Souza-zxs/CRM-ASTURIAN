import { Injectable, Logger } from '@nestjs/common';

import { WebSocket } from 'ws';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { type VoiceAgentEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-agent.entity';
import { VoiceCallEntity } from 'src/engine/metadata-modules/voice-agent/entities/voice-call.entity';
import { VoiceCallStatus } from 'src/engine/metadata-modules/voice-agent/types/voice-call-status.enum';
import { VoiceAgentInstructionsBuilderService } from 'src/modules/voice-agent/services/voice-agent-instructions-builder.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/zyra-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  type TwilioMediaStreamInboundEvent,
  type TwilioMediaStreamOutboundMediaEvent,
} from 'src/modules/voice-agent/types/twilio-media-stream-event.type';
import {
  END_CALL_TOOL_NAME,
  type OpenAiRealtimeAudioDeltaEvent,
  type OpenAiRealtimeAudioTranscriptDeltaEvent,
  type OpenAiRealtimeFunctionCallArgumentsDoneEvent,
  type OpenAiRealtimeInboundEvent,
  type OpenAiRealtimeInputAudioBufferAppendEvent,
  type OpenAiRealtimeSessionUpdateEvent,
} from 'src/modules/voice-agent/types/openai-realtime-event.type';

// Bridges one Twilio Media Streams WebSocket connection to one OpenAI
// Realtime API WebSocket connection, translating audio frames and
// bookkeeping the call's transcript/status as it goes. One instance of this
// "session" exists per phone call — see
// VoiceMediaStreamGateway.handleTwilioConnection, which calls attach() once
// per inbound WebSocket upgrade.
@Injectable()
export class VoiceRealtimeBridgeService {
  private readonly logger = new Logger(VoiceRealtimeBridgeService.name);

  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly voiceAgentInstructionsBuilderService: VoiceAgentInstructionsBuilderService,
    @InjectWorkspaceScopedRepository(VoiceCallEntity)
    private readonly voiceCallRepository: WorkspaceScopedRepository<VoiceCallEntity>,
  ) {}

  attach(
    twilioSocket: WebSocket,
    voiceCall: VoiceCallEntity,
    voiceAgent: VoiceAgentEntity,
  ): void {
    const openAiApiKey = this.zyraConfigService.get('OPENAI_API_KEY');

    if (!openAiApiKey) {
      this.logger.error(
        `OPENAI_API_KEY is not configured — dropping voice call ${voiceCall.id}`,
      );
      twilioSocket.close();

      return;
    }

    let streamSid: string | null = null;
    let transcriptBuffer = voiceCall.transcript ?? '';
    let hasFinalized = false;

    const openAiRealtimeModel = this.zyraConfigService.get(
      'OPENAI_REALTIME_MODEL',
    );

    // wss://api.openai.com/v1/realtime — documented WebSocket entrypoint for
    // the Realtime API. Header auth (not query-string) per OpenAI's docs.
    const openAiSocket = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(openAiRealtimeModel)}`,
      {
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      },
    );

    const finalizeCall = (status: VoiceCallStatus): void => {
      if (hasFinalized) {
        return;
      }
      hasFinalized = true;

      this.voiceCallRepository
        .update(
          voiceCall.workspaceId,
          { id: voiceCall.id },
          {
            status,
            endedAt: new Date(),
            transcript: transcriptBuffer || null,
          },
        )
        .catch((error: unknown) => {
          this.logger.error(
            `Failed to finalize voice call ${voiceCall.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        });
    };

    openAiSocket.on('open', () => {
      const sessionUpdate: OpenAiRealtimeSessionUpdateEvent = {
        type: 'session.update',
        session: {
          instructions:
            this.voiceAgentInstructionsBuilderService.buildInstructions(
              voiceAgent,
            ),
          voice: voiceAgent.voice,
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          turn_detection: { type: 'server_vad' },
          tools: [
            {
              type: 'function',
              name: END_CALL_TOOL_NAME,
              description:
                'Encerra a ligação quando a conversa chegou a um fim natural, o objetivo foi cumprido ou o interlocutor pediu para desligar.',
              parameters: {
                type: 'object',
                properties: { reason: { type: 'string' } },
                required: ['reason'],
              },
            },
          ],
        },
      };

      openAiSocket.send(JSON.stringify(sessionUpdate));
    });

    openAiSocket.on('message', (rawMessage: Buffer) => {
      let event: OpenAiRealtimeInboundEvent;

      try {
        event = JSON.parse(rawMessage.toString('utf-8'));
      } catch {
        this.logger.warn(
          `Received malformed OpenAI Realtime event on call ${voiceCall.id}`,
        );

        return;
      }

      switch (event.type) {
        case 'response.audio.delta': {
          if (!streamSid) {
            break;
          }

          const outboundMedia: TwilioMediaStreamOutboundMediaEvent = {
            event: 'media',
            streamSid,
            media: {
              payload: (event as OpenAiRealtimeAudioDeltaEvent).delta,
            },
          };

          if (twilioSocket.readyState === WebSocket.OPEN) {
            twilioSocket.send(JSON.stringify(outboundMedia));
          }
          break;
        }

        case 'response.audio_transcript.delta': {
          transcriptBuffer += (event as OpenAiRealtimeAudioTranscriptDeltaEvent)
            .delta;
          break;
        }

        case 'response.function_call_arguments.done': {
          const functionCall =
            event as OpenAiRealtimeFunctionCallArgumentsDoneEvent;

          if (functionCall.name === END_CALL_TOOL_NAME) {
            this.logger.log(
              `Voice agent ended call ${voiceCall.id} via ${END_CALL_TOOL_NAME}: ${functionCall.arguments}`,
            );
            finalizeCall(VoiceCallStatus.COMPLETED);
            twilioSocket.close();
          }
          break;
        }

        case 'error': {
          this.logger.error(
            `OpenAI Realtime API error on call ${voiceCall.id}: ${JSON.stringify(event)}`,
          );
          break;
        }

        default:
          // Session lifecycle events (session.created/updated,
          // response.done, etc.) — nothing to do with them today.
          break;
      }
    });

    openAiSocket.on('error', (error: Error) => {
      this.logger.error(
        `OpenAI Realtime socket error on call ${voiceCall.id}`,
        error.stack,
      );
    });

    openAiSocket.on('close', () => {
      finalizeCall(VoiceCallStatus.COMPLETED);
    });

    twilioSocket.on('message', (rawMessage: Buffer) => {
      let event: TwilioMediaStreamInboundEvent;

      try {
        event = JSON.parse(rawMessage.toString('utf-8'));
      } catch {
        return;
      }

      switch (event.event) {
        case 'start': {
          streamSid = event.start.streamSid;
          break;
        }

        case 'media': {
          if (openAiSocket.readyState === WebSocket.OPEN) {
            const appendEvent: OpenAiRealtimeInputAudioBufferAppendEvent = {
              type: 'input_audio_buffer.append',
              audio: event.media.payload,
            };

            openAiSocket.send(JSON.stringify(appendEvent));
          }
          break;
        }

        case 'stop': {
          finalizeCall(VoiceCallStatus.COMPLETED);

          if (
            openAiSocket.readyState === WebSocket.OPEN ||
            openAiSocket.readyState === WebSocket.CONNECTING
          ) {
            openAiSocket.close();
          }
          break;
        }

        default:
          break;
      }
    });

    twilioSocket.on('close', () => {
      finalizeCall(VoiceCallStatus.COMPLETED);

      if (
        openAiSocket.readyState === WebSocket.OPEN ||
        openAiSocket.readyState === WebSocket.CONNECTING
      ) {
        openAiSocket.close();
      }
    });

    twilioSocket.on('error', (error: Error) => {
      this.logger.error(
        `Twilio media stream socket error on call ${voiceCall.id}`,
        error.stack,
      );
    });
  }
}
