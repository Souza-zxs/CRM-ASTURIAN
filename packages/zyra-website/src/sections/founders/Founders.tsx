import { styled } from '@linaria/react';

import { buildSchemeContext } from '@/tokens';
import { NotchedCardShape, SectionShell } from '@/ui';

import { FoundersCarousel } from './FoundersCarousel';
import { FOUNDERS } from './founders.data';

// A dark notched panel on a light section: the black card fills the section and
// its notch reveals the white surface behind it (seamless with the white
// section above). The carousel sits on the card, so it adopts the dark scheme
// — its text, divider, and nav resolve to light inks while the section stays
// white through the notch. keepsTopRhythm stops the hero above (also light)
// from collapsing this section's top padding, which would butt the eyebrow
// against the notch.
const DarkPanel = styled.div`
  ${buildSchemeContext('dark')}
`;

export function Founders() {
  return (
    <SectionShell
      background={<NotchedCardShape cardScheme="dark" />}
      fullBleedBackground
      keepsTopRhythm
      rhythm="spacious"
      scheme="light"
    >
      <DarkPanel>
        <FoundersCarousel founders={FOUNDERS} />
      </DarkPanel>
    </SectionShell>
  );
}
