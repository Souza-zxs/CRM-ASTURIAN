import { Injectable } from '@nestjs/common';

import { type EmailDriverInterface } from 'src/engine/core-modules/email/drivers/interfaces/email-driver.interface';

import { LoggerDriver } from 'src/engine/core-modules/email/drivers/logger.driver';
import { SmtpDriver } from 'src/engine/core-modules/email/drivers/smtp.driver';
import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';
import { DriverFactoryBase } from 'src/engine/core-modules/zyra-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/zyra-config/enums/config-variables-group.enum';
import { ConfigGroupHashService } from 'src/engine/core-modules/zyra-config/services/config-group-hash.service';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class EmailDriverFactory extends DriverFactoryBase<EmailDriverInterface> {
  constructor(
    zyraConfigService: ZyraConfigService,
    configGroupHashService: ConfigGroupHashService,
  ) {
    super(zyraConfigService, configGroupHashService);
  }

  protected buildConfigKey(): string {
    const driver = this.zyraConfigService.get('EMAIL_DRIVER');

    if (driver === EmailDriver.LOGGER) {
      return 'logger';
    }

    if (driver === EmailDriver.SMTP) {
      const emailConfigHash = this.configGroupHashService.computeHash(
        ConfigVariablesGroup.EMAIL_SETTINGS,
      );

      return `smtp|${emailConfigHash}`;
    }

    throw new Error(`Unsupported email driver: ${driver}`);
  }

  protected createDriver(): EmailDriverInterface {
    const driver = this.zyraConfigService.get('EMAIL_DRIVER');

    switch (driver) {
      case EmailDriver.LOGGER:
        return new LoggerDriver();

      case EmailDriver.SMTP: {
        const host = this.zyraConfigService.get('EMAIL_SMTP_HOST');
        const port = this.zyraConfigService.get('EMAIL_SMTP_PORT');
        const user = this.zyraConfigService.get('EMAIL_SMTP_USER');
        const pass = this.zyraConfigService.get('EMAIL_SMTP_PASSWORD');
        const noTLS = this.zyraConfigService.get('EMAIL_SMTP_NO_TLS');

        if (!host || !port) {
          throw new Error('SMTP driver requires host and port to be defined');
        }

        const options: {
          host: string;
          port: number;
          auth?: { user: string; pass: string };
          secure?: boolean;
          ignoreTLS?: boolean;
          requireTLS?: boolean;
        } = { host, port };

        if (user && pass) {
          options.auth = { user, pass };
        }

        if (noTLS) {
          options.secure = false;
          options.ignoreTLS = true;
        }

        return new SmtpDriver(options);
      }

      default:
        throw new Error(`Invalid email driver: ${driver}`);
    }
  }
}
