import { Module } from '@nestjs/common';

import { ZyraORMModule } from 'src/engine/zyra-orm/zyra-orm.module';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [TimelineActivityModule, ZyraORMModule],
  providers: [UpsertTimelineActivityFromInternalEvent],
})
export class TimelineJobModule {}
