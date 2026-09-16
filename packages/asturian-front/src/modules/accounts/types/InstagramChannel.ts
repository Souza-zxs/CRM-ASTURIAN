import { type MessageChannelSyncStatus } from 'zyra-shared/types';

export type InstagramChannel = {
  id: string;
  connectedAccountId: string;
  igBusinessAccountId: string;
  username: string;
  profilePictureUrl: string | null;
  isSyncEnabled: boolean;
  syncStatus: MessageChannelSyncStatus;
  createdAt: string;
  updatedAt: string;
  __typename: 'InstagramChannel';
};
