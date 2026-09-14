import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConnectInstagramAccountInput {
  // The `code` returned in the query string after the Instagram
  // authorization redirect completes.
  @Field(() => String)
  code: string;
}
