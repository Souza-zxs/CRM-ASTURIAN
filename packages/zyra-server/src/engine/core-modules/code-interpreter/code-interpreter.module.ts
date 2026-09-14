import { type DynamicModule, Global } from '@nestjs/common';

import { CodeInterpreterDriverFactory } from 'src/engine/core-modules/code-interpreter/code-interpreter-driver.factory';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';

@Global()
export class CodeInterpreterModule {
  static forRoot(): DynamicModule {
    return {
      module: CodeInterpreterModule,
      imports: [ZyraConfigModule],
      providers: [CodeInterpreterDriverFactory, CodeInterpreterService],
      exports: [CodeInterpreterService],
    };
  }
}
