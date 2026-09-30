export type WhatsappThreadMessageParticipant = {
  id: string;
  role: string;
  handle: string | null;
};

export type WhatsappThreadMessage = {
  id: string;
  text: string | null;
  receivedAt: string | null;
  createdAt: string;
  messageParticipants: WhatsappThreadMessageParticipant[];
};
