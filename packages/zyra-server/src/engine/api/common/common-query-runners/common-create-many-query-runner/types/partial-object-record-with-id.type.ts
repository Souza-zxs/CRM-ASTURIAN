import { type ObjectRecord } from 'zyra-shared/types';

export type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
