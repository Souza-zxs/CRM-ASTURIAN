import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ConnectWhatsappNumberOutput')
export class ConnectWhatsappNumberOutputDTO {
  @Field(() => String)
  whatsappChannelId: string;

  @Field(() => String)
  displayPhoneNumber: string;
}
