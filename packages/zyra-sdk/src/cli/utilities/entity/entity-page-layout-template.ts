import { v4 as uuidv4 } from 'uuid';

export const getPageLayoutBaseFile = ({ name }: { name: string }) => {
  return `import { definePageLayout } from 'zyra-sdk/define';

export default definePageLayout({
  universalIdentifier: '${uuidv4()}',
  name: '${name}',
  tabs: [
    {
      universalIdentifier: '${uuidv4()}',
      title: 'Overview',
      widgets: [],
    },
  ],
});
`;
};
