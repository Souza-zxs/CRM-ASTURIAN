import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { useContext } from 'react';
import { ThemeContext } from 'zyra-ui/theme-constants';

type LineAreaHatchPatternDefProps = {
  id: string;
};

export const LineAreaHatchPatternDef = ({
  id,
}: LineAreaHatchPatternDefProps) => {
  const { theme } = useContext(ThemeContext);

  const tileSize = COMMON_CHART_CONSTANTS.HATCH_TILE_SIZE;
  const half = tileSize / 2;

  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={tileSize}
      height={tileSize}
    >
      <rect
        width={tileSize}
        height={tileSize}
        fill={theme.background.transparent.light}
      />
      {/* Three segments so the diagonal stripes join seamlessly across tiles, same as the bar chart's canvas hatch. */}
      <path
        d={`M0,${tileSize} L${tileSize},0 M${-half},${half} L${half},${-half} M${half},${tileSize + half} L${tileSize + half},${half}`}
        stroke={theme.border.color.medium}
        strokeWidth={COMMON_CHART_CONSTANTS.HATCH_LINE_WIDTH}
      />
    </pattern>
  );
};
