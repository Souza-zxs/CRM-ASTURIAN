import { Field, ObjectType } from '@nestjs/graphql';

// Static, hardcoded starting points offered in the "new campaign" builder
// (built in the front-end) so a user isn't starting from a blank form. Not
// backed by a database table — see INSTAGRAM_CAMPAIGN_TEMPLATES.
@ObjectType('InstagramCampaignTemplate')
export class InstagramCampaignTemplateDTO {
  @Field()
  key: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [String])
  suggestedKeywords: string[];

  @Field()
  suggestedReplyMessage: string;

  @Field(() => [String])
  suggestedPublicReplyVariations: string[];

  @Field(() => String, { nullable: true })
  suggestedFollowUpMessage: string | null;
}
