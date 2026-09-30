import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PaymentProvider } from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';
import { PaymentWebhookEventLogEntity } from 'src/engine/metadata-modules/payments/entities/payment-webhook-event-log.entity';
import { PaymentWebhookIdempotencyService } from 'src/modules/payments/services/payment-webhook-idempotency.service';

describe('PaymentWebhookIdempotencyService', () => {
  let service: PaymentWebhookIdempotencyService;
  let eventLogRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  const key = {
    workspaceId: 'workspace-1',
    provider: PaymentProvider.HOTMART,
    externalId: 'HP123',
    type: 'purchase' as const,
  };

  beforeEach(async () => {
    eventLogRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      create: jest.fn((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentWebhookIdempotencyService,
        {
          provide: getRepositoryToken(PaymentWebhookEventLogEntity),
          useValue: eventLogRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentWebhookIdempotencyService>(
      PaymentWebhookIdempotencyService,
    );
  });

  describe('hasAlreadySucceeded', () => {
    it('returns false when no log row exists yet', async () => {
      eventLogRepository.findOne.mockResolvedValue(null);

      expect(await service.hasAlreadySucceeded(key)).toBe(false);
    });

    it('returns false when a log row exists but has not succeeded', async () => {
      eventLogRepository.findOne.mockResolvedValue({
        id: 'log-1',
        succeededAt: null,
      });

      expect(await service.hasAlreadySucceeded(key)).toBe(false);
    });

    it('returns true when the log row already succeeded', async () => {
      eventLogRepository.findOne.mockResolvedValue({
        id: 'log-1',
        succeededAt: new Date(),
      });

      expect(await service.hasAlreadySucceeded(key)).toBe(true);
    });
  });

  describe('markSucceeded', () => {
    it('creates a new log row when none exists', async () => {
      eventLogRepository.findOne.mockResolvedValue(null);

      await service.markSucceeded(key);

      expect(eventLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...key, succeededAt: expect.any(Date) }),
      );
    });

    it('updates the existing log row instead of creating a duplicate', async () => {
      eventLogRepository.findOne.mockResolvedValue({ id: 'log-1' });

      await service.markSucceeded(key);

      expect(eventLogRepository.update).toHaveBeenCalledWith(
        'log-1',
        expect.objectContaining({ succeededAt: expect.any(Date) }),
      );
      expect(eventLogRepository.save).not.toHaveBeenCalled();
    });
  });
});
