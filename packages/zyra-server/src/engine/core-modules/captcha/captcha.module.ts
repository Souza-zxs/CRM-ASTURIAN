import { type DynamicModule, Global } from '@nestjs/common';

import { CaptchaDriverFactory } from 'src/engine/core-modules/captcha/captcha-driver.factory';
import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';

@Global()
export class CaptchaModule {
  static forRoot(): DynamicModule {
    return {
      module: CaptchaModule,
      imports: [ZyraConfigModule, SecureHttpClientModule],
      providers: [CaptchaDriverFactory, CaptchaService],
      exports: [CaptchaService],
    };
  }
}
