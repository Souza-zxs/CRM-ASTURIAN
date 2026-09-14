import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ConnectInstagramAccountOutput')
export class ConnectInstagramAccountOutputDTO {
  @Field(() => String)
  instagramChannelId: string;

  @Field(() => String)
  username: string;
}
