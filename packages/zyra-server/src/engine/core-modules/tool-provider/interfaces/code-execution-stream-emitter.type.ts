import { type CodeExecutionData } from 'zyra-shared/ai';

export type CodeExecutionStreamEmitter = (data: CodeExecutionData) => void;
