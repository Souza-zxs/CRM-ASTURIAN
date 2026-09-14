import { styled } from '@linaria/react';
import { type IconComponent } from 'zyra-ui/icon';
import { FloatingIconButton } from 'zyra-ui/input';
import { AnimatedContainer } from 'zyra-ui/layout';

const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordInlineCellButton = ({
  Icon,
  onClick,
}: {
  Icon: IconComponent;
  onClick?: () => void;
}) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer onClick={onClick}>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
