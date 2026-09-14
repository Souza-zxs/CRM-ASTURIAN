import { Module } from '@nestjs/common';

import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';

@Module({
  imports: [ZyraConfigModule],
  providers: [GoogleAPIRefreshAccessTokenService],
  exports: [GoogleAPIRefreshAccessTokenService],
})
export class GoogleAPIRefreshAccessTokenModule {}
