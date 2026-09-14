import { Module } from '@nestjs/common';

import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [ZyraConfigModule, OAuth2ClientManagerModule],
  providers: [GoogleCalendarGetEventsService],
  exports: [GoogleCalendarGetEventsService],
})
export class GoogleCalendarDriverModule {}
