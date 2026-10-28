import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
`;

type PagePanelProps = {
  children: React.ReactNode;
  hasInformationBar?: boolean;
};

export const PagePanel = ({ children }: PagePanelProps) => (
  <StyledPanel>{children}</StyledPanel>
);
