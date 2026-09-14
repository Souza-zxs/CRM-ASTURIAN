import { type DynamicModule, Global, Module } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/zyra-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/zyra-config/constants/config-variables-instance-tokens.constants';
import { DatabaseConfigModule } from 'src/engine/core-modules/zyra-config/drivers/database-config.module';
import { ConfigGroupHashService } from 'src/engine/core-modules/zyra-config/services/config-group-hash.service';
import { ConfigurableModuleClass } from 'src/engine/core-modules/zyra-config/zyra-config.module-definition';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Global()
@Module({})
export class ZyraConfigModule extends ConfigurableModuleClass {
  static forRoot(): DynamicModule {
    const isConfigVariablesInDbEnabled =
      process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED !== 'false';

    const imports = isConfigVariablesInDbEnabled
      ? [DatabaseConfigModule.forRoot()]
      : [];

    return {
      module: ZyraConfigModule,
      imports,
      providers: [
        ZyraConfigService,
        ConfigGroupHashService,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [ZyraConfigService, ConfigGroupHashService],
    };
  }
}
