import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { type BaseOutputSchemaV2 } from 'zyra-shared/workflow';

export type CodeOutputSchema = LinkOutputSchema | BaseOutputSchemaV2;
