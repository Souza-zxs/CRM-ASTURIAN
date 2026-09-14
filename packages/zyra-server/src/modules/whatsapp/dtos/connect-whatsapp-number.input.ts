import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConnectWhatsappNumberInput {
  // The `code` FB.login() returns to the front-end after the Embedded
  // Signup popup completes.
  @Field(() => String)
  code: string;

  @Field(() => String)
  wabaId: string;

  @Field(() => String)
  phoneNumberId: string;
}
