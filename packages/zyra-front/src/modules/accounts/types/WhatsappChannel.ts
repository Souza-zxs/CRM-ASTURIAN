import { type MessageChannelSyncStatus } from 'zyra-shared/types';

export type WhatsappChannel = {
  id: string;
  connectedAccountId: string;
  phoneNumberId: string;
  wabaId: string;
  displayPhoneNumber: string;
  isSyncEnabled: boolean;
  syncStatus: MessageChannelSyncStatus;
  createdAt: string;
  updatedAt: string;
  __typename: 'WhatsappChannel';
};
