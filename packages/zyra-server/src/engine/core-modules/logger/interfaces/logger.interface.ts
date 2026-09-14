import { type LogLevel } from '@nestjs/common';

export type ZyraLogLevel = LogLevel | 'performance';

export enum LoggerDriverType {
  CONSOLE = 'CONSOLE',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriverType.CONSOLE;
  logLevels?: ZyraLogLevel[];
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
