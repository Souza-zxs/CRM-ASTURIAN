import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class BillingDisabledGuard implements CanActivate {
  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    return !this.zyraConfigService.isBillingEnabled();
  }
}
