import {
  LoggerDriverType,
  type LoggerModuleOptions,
} from 'src/engine/core-modules/logger/interfaces';
import { type ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

/**
 * Logger Module factory
 * @returns LoggerModuleOptions
 * @param zyraConfigService
 */
export const loggerModuleFactory = async (
  zyraConfigService: ZyraConfigService,
): Promise<LoggerModuleOptions> => {
  const driverType = zyraConfigService.get('LOGGER_DRIVER');
  const logLevels = zyraConfigService.get('LOG_LEVELS');

  switch (driverType) {
    case LoggerDriverType.CONSOLE: {
      return {
        type: LoggerDriverType.CONSOLE,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
