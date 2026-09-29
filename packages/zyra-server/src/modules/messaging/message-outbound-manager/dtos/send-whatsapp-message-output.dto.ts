import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendWhatsappMessageOutput')
export class SendWhatsappMessageOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
