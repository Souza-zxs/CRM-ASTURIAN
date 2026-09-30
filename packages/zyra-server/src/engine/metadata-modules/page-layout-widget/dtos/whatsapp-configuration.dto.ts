import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WhatsappConfiguration } from 'zyra-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WhatsappConfiguration')
export class WhatsappConfigurationDTO implements WhatsappConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WHATSAPP])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WHATSAPP;
}
