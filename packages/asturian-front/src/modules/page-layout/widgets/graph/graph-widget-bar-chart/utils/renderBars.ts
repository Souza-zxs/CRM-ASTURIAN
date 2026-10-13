import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { type BarPosition } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarPosition';
import {
  drawHorizontalRoundedRect,
  drawRoundedRect,
} from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/drawRoundedRect';

const getPeakIndexValue = (bars: BarPosition[]): string | null => {
  let peakBar: BarPosition | null = null;

  for (const bar of bars) {
    if (peakBar === null || bar.value > peakBar.value) {
      peakBar = bar;
    }
  }

  return peakBar?.indexValue ?? null;
};

export const renderBars = ({
  ctx,
  bars,
  borderRadius,
  isVertical,
  highlightedLegendId,
  hoveredIndexValue,
  inactiveFill,
}: {
  ctx: CanvasRenderingContext2D;
  bars: BarPosition[];
  borderRadius: number;
  isVertical: boolean;
  highlightedLegendId: string | null;
  hoveredIndexValue: string | null;
  inactiveFill: CanvasPattern | null;
}): void => {
  // With a single series there is no color to tell bars apart, so one bar
  // carries the color (hovered, or the peak at rest) and the rest are hatched.
  // With several series every bar keeps its series color.
  const isSingleSeries =
    new Set(bars.map((bar) => bar.seriesId)).size === 1 && bars.length > 1;

  const emphasizedIndexValue =
    isSingleSeries && inactiveFill !== null
      ? (hoveredIndexValue ?? getPeakIndexValue(bars))
      : null;

  for (const bar of bars) {
    const isDimmed =
      highlightedLegendId !== null && bar.seriesId !== highlightedLegendId;

    const isInactive =
      emphasizedIndexValue !== null && bar.indexValue !== emphasizedIndexValue;

    ctx.globalAlpha = isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1;
    ctx.fillStyle =
      isInactive && inactiveFill !== null ? inactiveFill : bar.color;

    const isNegative = bar.value < 0;

    if (isVertical) {
      const roundTop = bar.shouldRoundFreeEnd && !isNegative;
      const roundBottom = bar.shouldRoundFreeEnd && isNegative;

      drawRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundTop,
        roundBottom,
      });
    } else {
      const roundRight = bar.shouldRoundFreeEnd && !isNegative;
      const roundLeft = bar.shouldRoundFreeEnd && isNegative;

      drawHorizontalRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundLeft,
        roundRight,
      });
    }
  }

  ctx.globalAlpha = 1;
};
