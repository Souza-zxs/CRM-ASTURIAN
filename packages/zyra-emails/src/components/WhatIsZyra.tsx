import { type I18n } from '@lingui/core';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';
import { brand } from 'src/utils/brand';

type WhatIsZyraProps = {
  i18n: I18n;
};

export const WhatIsZyra = ({ i18n }: WhatIsZyraProps) => {
  return (
    <>
      <SubTitle
        value={i18n._('What is {productName}?', {
          productName: brand.productName,
        })}
      />
      <MainText>
        {i18n._(
          "It's a CRM, a software to help businesses manage their customer data and relationships efficiently.",
        )}
      </MainText>
    </>
  );
};
