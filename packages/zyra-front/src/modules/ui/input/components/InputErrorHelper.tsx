import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'zyra-shared/utils';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledInputErrorHelper = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 1px;
  position: absolute;
`;

export const InputErrorHelper = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <div>
    {isDefined(children) && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </div>
);
