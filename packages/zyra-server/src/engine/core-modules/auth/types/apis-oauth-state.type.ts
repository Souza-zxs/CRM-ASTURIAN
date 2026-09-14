import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from 'zyra-shared/types';

export type APIsOAuthState = {
  transientToken?: string;
  redirectLocation?: string;
  calendarVisibility?: CalendarChannelVisibility;
  messageVisibility?: MessageChannelVisibility;
  skipMessageChannelConfiguration?: boolean;
};
