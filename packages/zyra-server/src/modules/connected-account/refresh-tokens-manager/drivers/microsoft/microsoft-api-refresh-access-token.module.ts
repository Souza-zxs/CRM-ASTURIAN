import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';

@Module({
  imports: [ZyraConfigModule, JwtModule],
  providers: [MicrosoftAPIRefreshAccessTokenService],
  exports: [MicrosoftAPIRefreshAccessTokenService],
})
export class MicrosoftAPIRefreshAccessTokenModule {}
