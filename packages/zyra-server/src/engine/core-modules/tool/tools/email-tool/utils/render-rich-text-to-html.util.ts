import { render } from '@react-email/render';
import { type JSONContent, reactMarkupFromJSON } from 'zyra-emails';

export const renderRichTextToHtml = async (
  jsonContent: JSONContent,
): Promise<string> => {
  const reactMarkup = reactMarkupFromJSON(jsonContent);

  return render(reactMarkup);
};
