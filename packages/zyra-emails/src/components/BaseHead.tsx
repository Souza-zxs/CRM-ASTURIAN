import { Font, Head } from '@react-email/components';

import { emailTheme } from 'src/common-style';
import { brand } from 'src/utils/brand';

export const BaseHead = () => {
  return (
    <Head>
      <title>{brand.productName} email</title>
      <Font
        fontFamily={emailTheme.font.family}
        fallbackFontFamily="sans-serif"
        fontStyle="normal"
        fontWeight={emailTheme.font.weight.regular}
      />
    </Head>
  );
};
