import { isDefined } from 'zyra-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchObjectMetadataId =
  (objectMetadataItemId: unknown) => (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId === objectMetadataItemId;
