import { type jsonRelationFilterValueSchema } from 'zyra-shared/utils';
import { type z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
