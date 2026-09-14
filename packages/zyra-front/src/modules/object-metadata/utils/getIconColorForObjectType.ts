import { themeCssVariables } from 'zyra-ui/theme-constants';

export const getIconColorForObjectType = (objectType: string): string => {
  switch (objectType) {
    case 'note':
      return themeCssVariables.color.yellow;
    case 'task':
      return themeCssVariables.color.blue;
    default:
      return 'currentColor';
  }
};
