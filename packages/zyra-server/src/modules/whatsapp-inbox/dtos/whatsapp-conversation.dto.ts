import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WhatsappConversation')
export class WhatsappConversationDTO {
  @Field(() => String)
  messageThreadId: string;

  @Field(() => String)
  contactPhoneNumber: string;

  @Field(() => String)
  contactDisplayName: string;

  @Field(() => String, { nullable: true })
  personId: string | null;

  @Field(() => String)
  lastMessageBody: string;

  @Field(() => Date)
  lastMessageReceivedAt: Date;
}
