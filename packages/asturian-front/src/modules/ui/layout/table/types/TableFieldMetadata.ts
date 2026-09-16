import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'zyra-ui/icon';

export type TableFieldMetadata<ItemType> = {
  fieldLabel: MessageDescriptor;
  fieldName: keyof ItemType;
  fieldType: 'string' | 'number';
  align: 'left' | 'right';
  FieldIcon?: IconComponent;
};
