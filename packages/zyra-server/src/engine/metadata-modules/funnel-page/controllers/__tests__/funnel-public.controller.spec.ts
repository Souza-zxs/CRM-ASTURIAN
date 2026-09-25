import { HttpStatus } from '@nestjs/common';

import { type Request } from 'express';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { FunnelPublicController } from 'src/engine/metadata-modules/funnel-page/controllers/funnel-public.controller';

const WORKSPACE_ID = 'f7a7d81f-b6b3-42f3-8bba-51e74e90af90';
const LEAD_ID = '22222222-2222-4222-8222-222222222222';
const IP_ADDRESS = '203.0.113.7';

const request = { ip: IP_ADDRESS } as Request;

const leadBody = {
  funnelPageId: '11111111-1111-4111-8111-111111111111',
  name: ' Maria da Silva ',
  email: ' Maria@Example.com ',
  whatsapp: ' (83) 99999-9999 ',
};

describe('FunnelPublicController', () => {
  const funnelPageMetadataService = {
    createLead: jest.fn(),
    markLeadAsAttendee: jest.fn(),
    findLeadSignupTime: jest.fn(),
  };
  const throttlerService = { tokenBucketThrottleOrThrow: jest.fn() };

  const buildController = () =>
    new FunnelPublicController(
      funnelPageMetadataService as never,
      throttlerService as never,
    );

  const limitReached = () =>
    new ThrottlerException('limit', ThrottlerExceptionCode.LIMIT_REACHED);

  beforeEach(() => {
    jest.clearAllMocks();
    throttlerService.tokenBucketThrottleOrThrow.mockResolvedValue(10);
    funnelPageMetadataService.createLead.mockResolvedValue({ id: LEAD_ID });
    funnelPageMetadataService.markLeadAsAttendee.mockResolvedValue(undefined);
    funnelPageMetadataService.findLeadSignupTime.mockResolvedValue(
      new Date('2026-09-25T12:00:00.000Z'),
    );
  });

  describe('createLead', () => {
    it('should return the new lead id and normalize the submitted data', async () => {
      const result = await buildController().createLead(
        WORKSPACE_ID,
        leadBody as never,
        request,
      );

      expect(result).toEqual({ success: true, leadId: LEAD_ID });
      expect(funnelPageMetadataService.createLead).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        input: expect.objectContaining({
          name: 'Maria da Silva',
          email: 'maria@example.com',
          whatsapp: '(83) 99999-9999',
        }),
      });
    });

    it('should rate limit per workspace and IP address', async () => {
      await buildController().createLead(
        WORKSPACE_ID,
        leadBody as never,
        request,
      );

      expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        `funnel-lead:${WORKSPACE_ID}:${IP_ADDRESS}`,
        1,
        20,
        3_600_000,
      );
    });

    it('should answer 429 and store nothing when the limit is reached', async () => {
      throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
        limitReached(),
      );

      await expect(
        buildController().createLead(WORKSPACE_ID, leadBody as never, request),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
      expect(funnelPageMetadataService.createLead).not.toHaveBeenCalled();
    });

    it('should reject an invalid workspace id before touching the limiter', async () => {
      await expect(
        buildController().createLead('not-a-uuid', leadBody as never, request),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
      expect(
        throttlerService.tokenBucketThrottleOrThrow,
      ).not.toHaveBeenCalled();
    });
  });

  describe('markLeadAsAttendee', () => {
    it('should mark the lead as attendee', async () => {
      const result = await buildController().markLeadAsAttendee(
        WORKSPACE_ID,
        LEAD_ID,
        request,
      );

      expect(result).toEqual({ success: true });
      expect(funnelPageMetadataService.markLeadAsAttendee).toHaveBeenCalledWith(
        { workspaceId: WORKSPACE_ID, leadId: LEAD_ID },
      );
    });

    it('should answer 429 when the limit is reached', async () => {
      throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
        limitReached(),
      );

      await expect(
        buildController().markLeadAsAttendee(WORKSPACE_ID, LEAD_ID, request),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
      expect(
        funnelPageMetadataService.markLeadAsAttendee,
      ).not.toHaveBeenCalled();
    });

    it('should reject an invalid lead id', async () => {
      await expect(
        buildController().markLeadAsAttendee(
          WORKSPACE_ID,
          'not-a-uuid',
          request,
        ),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  describe('getLeadSignupTime', () => {
    it('should return the signup instant as an ISO string', async () => {
      const result = await buildController().getLeadSignupTime(
        WORKSPACE_ID,
        LEAD_ID,
        request,
      );

      expect(result).toEqual({ signedUpAt: '2026-09-25T12:00:00.000Z' });
      expect(funnelPageMetadataService.findLeadSignupTime).toHaveBeenCalledWith(
        { workspaceId: WORKSPACE_ID, leadId: LEAD_ID },
      );
    });

    it('should answer 429 when the limit is reached', async () => {
      throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
        limitReached(),
      );

      await expect(
        buildController().getLeadSignupTime(WORKSPACE_ID, LEAD_ID, request),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
      expect(
        funnelPageMetadataService.findLeadSignupTime,
      ).not.toHaveBeenCalled();
    });

    it('should reject an invalid lead id', async () => {
      await expect(
        buildController().getLeadSignupTime(
          WORKSPACE_ID,
          'not-a-uuid',
          request,
        ),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });
});
