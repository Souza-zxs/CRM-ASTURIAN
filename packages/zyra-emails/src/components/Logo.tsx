import { Img } from '@react-email/components';
import { brand } from 'src/utils/brand';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src={brand.logoUrl}
      alt={`${brand.productName} logo`}
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
