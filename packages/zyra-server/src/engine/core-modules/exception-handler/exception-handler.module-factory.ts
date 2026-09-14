import { type HttpAdapterHost } from '@nestjs/core';

import { NodeEnvironment } from 'src/engine/core-modules/zyra-config/interfaces/node-environment.interface';

import { type OPTIONS_TYPE } from 'src/engine/core-modules/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { type ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

/**
 * ExceptionHandler Module factory
 * @returns ExceptionHandlerModuleOptions
 * @param zyraConfigService
 * @param adapterHost
 */
export const exceptionHandlerModuleFactory = async (
  zyraConfigService: ZyraConfigService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = zyraConfigService.get('EXCEPTION_HANDLER_DRIVER');

  switch (driverType) {
    case ExceptionHandlerDriver.CONSOLE: {
      return {
        type: ExceptionHandlerDriver.CONSOLE,
      };
    }
    case ExceptionHandlerDriver.SENTRY: {
      return {
        type: ExceptionHandlerDriver.SENTRY,
        options: {
          environment: zyraConfigService.get('SENTRY_ENVIRONMENT'),
          release: zyraConfigService.get('APP_VERSION'),
          dsn: zyraConfigService.get('SENTRY_DSN') ?? '',
          serverInstance: adapterHost.httpAdapter?.getInstance(),
          debug:
            zyraConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT,
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer driver type (${driverType}), check your .env file`,
      );
  }
};
