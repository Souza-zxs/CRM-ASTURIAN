import { type LogicFunctionManifest } from 'zyra-shared/application';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

export type LogicFunctionConfig = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
> & {
  handler: LogicFunctionHandler;
};
