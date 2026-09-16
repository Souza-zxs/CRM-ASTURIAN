import { type InstagramFollowerSnapshot } from '@/accounts/types/InstagramFollowerSnapshot';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'zyra-ui/theme-constants';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const CHART_PADDING = 24;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledSvg = styled.svg`
  height: auto;
  width: 100%;
`;

const StyledAxisLabel = styled.text`
  fill: ${themeCssVariables.font.color.light};
  font-size: 11px;
`;

// Visually hidden but available to screen readers and, per accessibility
// guidance, gives every chart a table-shaped fallback.
const StyledVisuallyHiddenTable = styled.table`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const buildLinePath = (points: { x: number; y: number }[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

type SettingsAccountsInstagramFollowerChartProps = {
  snapshots: InstagramFollowerSnapshot[];
};

export const SettingsAccountsInstagramFollowerChart = ({
  snapshots,
}: SettingsAccountsInstagramFollowerChartProps) => {
  const { t } = useLingui();

  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  const followerCounts = sortedSnapshots.map((snapshot) => snapshot.followerCount);
  const minFollowerCount = Math.min(...followerCounts);
  const maxFollowerCount = Math.max(...followerCounts);
  const followerCountRange = Math.max(maxFollowerCount - minFollowerCount, 1);

  const plotWidth = CHART_WIDTH - CHART_PADDING * 2;
  const plotHeight = CHART_HEIGHT - CHART_PADDING * 2;

  const points = sortedSnapshots.map((snapshot, index) => {
    const x =
      CHART_PADDING +
      (sortedSnapshots.length > 1
        ? (index / (sortedSnapshots.length - 1)) * plotWidth
        : plotWidth / 2);
    const y =
      CHART_PADDING +
      plotHeight -
      ((snapshot.followerCount - minFollowerCount) / followerCountRange) * plotHeight;

    return { x, y, snapshot };
  });

  const linePath = buildLinePath(points);
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? CHART_PADDING},${
    CHART_PADDING + plotHeight
  } L${points[0]?.x ?? CHART_PADDING},${CHART_PADDING + plotHeight} Z`;

  const firstSnapshot = sortedSnapshots[0];
  const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

  return (
    <StyledContainer>
      <StyledSvg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={t`Follower count over time`}
      >
        <line
          x1={CHART_PADDING}
          y1={CHART_PADDING + plotHeight}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={CHART_PADDING + plotHeight}
          stroke={themeCssVariables.border.color.light}
          strokeWidth={1}
        />
        {points.length > 1 && (
          <path
            d={areaPath}
            fill={themeCssVariables.color.blue}
            opacity={0.08}
            stroke="none"
          />
        )}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={themeCssVariables.color.blue}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((point) => (
          <circle
            key={point.snapshot.id}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={themeCssVariables.color.blue}
          >
            <title>
              {`${new Date(point.snapshot.capturedAt).toLocaleDateString()}: ${point.snapshot.followerCount}`}
            </title>
          </circle>
        ))}
        {firstSnapshot && (
          <StyledAxisLabel x={CHART_PADDING} y={CHART_HEIGHT - 4}>
            {new Date(firstSnapshot.capturedAt).toLocaleDateString()}
          </StyledAxisLabel>
        )}
        {lastSnapshot && lastSnapshot !== firstSnapshot && (
          <StyledAxisLabel
            x={CHART_WIDTH - CHART_PADDING}
            y={CHART_HEIGHT - 4}
            textAnchor="end"
          >
            {new Date(lastSnapshot.capturedAt).toLocaleDateString()}
          </StyledAxisLabel>
        )}
      </StyledSvg>
      <StyledVisuallyHiddenTable>
        <caption>{t`Follower count over time`}</caption>
        <thead>
          <tr>
            <th>{t`Date`}</th>
            <th>{t`Followers`}</th>
          </tr>
        </thead>
        <tbody>
          {sortedSnapshots.map((snapshot) => (
            <tr key={snapshot.id}>
              <td>{new Date(snapshot.capturedAt).toLocaleDateString()}</td>
              <td>{snapshot.followerCount}</td>
            </tr>
          ))}
        </tbody>
      </StyledVisuallyHiddenTable>
    </StyledContainer>
  );
};
