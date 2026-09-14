import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { PageLayoutTabLayoutMode } from 'zyra-shared/types';

@ObjectType('PageLayoutWidgetCanvasPosition')
export class PageLayoutWidgetCanvasPositionDTO {
  @Field(() => PageLayoutTabLayoutMode)
  @IsIn([PageLayoutTabLayoutMode.CANVAS])
  @IsNotEmpty()
  layoutMode: PageLayoutTabLayoutMode.CANVAS;
}
