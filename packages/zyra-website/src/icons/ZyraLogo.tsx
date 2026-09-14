import { semanticColor } from '@/tokens';

const ZYRA_MARK_OUTLINE =
  'M 11.72 15.16 L 10.00 13.28 L 13.05 10.31 L 28.28 10.31 L 28.28 13.44 L 17.97 23.59 L 28.28 23.59 L 30.39 25.63 L 28.28 27.66 L 11.72 27.66 L 10.23 29.45 L 11.72 24.53 L 22.03 15.16 Z';

const ZYRA_MARK_FACETS = [
  ['13.05 10.31', '19.14 13.28'],
  ['19.14 13.28', '10.00 13.28'],
  ['19.14 13.28', '28.28 13.44'],
  ['27.34 13.59', '17.03 23.75'],
  ['17.97 23.59', '21.09 23.59'],
  ['11.72 24.53', '17.97 26.17'],
  ['17.97 26.17', '28.28 23.59'],
];

export type ZyraLogoProps = {
  sizePx?: number;
};

// Brand mark on its scheme's ink, so it inverts on dark surfaces with no
// color props.
export function ZyraLogo({ sizePx = 40 }: ZyraLogoProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      viewBox="0 0 40 40"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={semanticColor.ink} height={40} rx={4} width={40} />
      <path
        d={ZYRA_MARK_OUTLINE}
        stroke={semanticColor.surface}
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
      {ZYRA_MARK_FACETS.map(([from, to]) => {
        const [x1, y1] = from.split(' ');
        const [x2, y2] = to.split(' ');
        return (
          <line
            key={`${from}-${to}`}
            stroke={semanticColor.surface}
            strokeLinecap="round"
            strokeWidth={0.7}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        );
      })}
    </svg>
  );
}
