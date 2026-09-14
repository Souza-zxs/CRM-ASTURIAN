import { type ExecutionContext } from '@nestjs/common';

import { type ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/cloudflare/guards/cloudflare-secret.guard';

const buildMockContext = (headers: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

describe('CloudflareSecretMatchGuard.canActivate', () => {
  let guard: CloudflareSecretMatchGuard;
  let zyraConfigService: ZyraConfigService;

  beforeEach(() => {
    zyraConfigService = {
      get: jest.fn(),
    } as unknown as ZyraConfigService;
    guard = new CloudflareSecretMatchGuard(zyraConfigService);
  });

  it('should return true when the webhook secret matches', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue('valid-secret');

    const context = buildMockContext({
      'cf-webhook-auth': 'valid-secret',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw InternalServerErrorException when env is not set', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue(undefined);

    const context = buildMockContext({
      'cf-webhook-auth': 'any-value',
    });

    expect(() => guard.canActivate(context)).toThrow(
      'CLOUDFLARE_WEBHOOK_SECRET is not configured',
    );
  });

  it('should return false when the header is missing', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue('valid-secret');

    const context = buildMockContext({});

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false when the header value is wrong', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue('valid-secret');

    const context = buildMockContext({
      'cf-webhook-auth': 'wrong-secret',
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false when the header is an empty string', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue('valid-secret');

    const context = buildMockContext({
      'cf-webhook-auth': '',
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false when header length differs from secret', () => {
    jest.spyOn(zyraConfigService, 'get').mockReturnValue('short');

    const context = buildMockContext({
      'cf-webhook-auth': 'much-longer-value',
    });

    expect(guard.canActivate(context)).toBe(false);
  });
});
