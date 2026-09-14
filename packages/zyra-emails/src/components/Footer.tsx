import { type I18n } from '@lingui/core';
import { Column, Container, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';
import { brand } from 'src/utils/brand';

const footerContainerStyle = {
  marginTop: '12px',
};

type FooterProps = {
  i18n: I18n;
};

export const Footer = ({ i18n }: FooterProps) => {
  return (
    <Container style={footerContainerStyle}>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href={brand.websiteUrl}
              value={i18n._('Website')}
              aria-label={i18n._("Visit {productName}'s website", {
                productName: brand.productName,
              })}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href={`${brand.docsUrl}/getting-started/introduction`}
              value={i18n._('User guide')}
              aria-label={i18n._("Read {productName}'s user guide", {
                productName: brand.productName,
              })}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href={brand.docsUrl}
              value={i18n._('Developers')}
              aria-label={i18n._(
                "Visit {productName}'s developer documentation",
                { productName: brand.productName },
              )}
            />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        <>{brand.legalFooterText}</>
      </ShadowText>
    </Container>
  );
};
