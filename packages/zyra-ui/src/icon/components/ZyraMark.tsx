import { themeCssVariables } from '@ui/theme-constants';

// Same wireframe "Z" glyph used on zyra-website's brand mark, ported so the
// app (zyra-front) can render it too — colored with the app's accent
// (violet) instead of the website's monochromatic ink/surface scheme, since
// the two surfaces intentionally use different color systems.
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

export type ZyraMarkProps = {
  sizePx?: number;
  // Omit the filled rounded-square badge and draw only the line art — for
  // placing the mark directly on an already-colored surface (e.g. the auth
  // split layout's brand panel), where a second violet square would be
  // redundant.
  showBackground?: boolean;
};

export function ZyraMark({ sizePx = 40, showBackground = true }: ZyraMarkProps) {
  // The line art always sits on a violet field — either this component's own
  // filled square, or (when showBackground is false) a violet surface the
  // caller already provides — so it stays the light contrast color either way.
  const lineColor = themeCssVariables.color.blue1;

  return (
    <svg
      fill="none"
      height={sizePx}
      viewBox="0 0 40 40"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      {showBackground && (
        <rect
          fill={themeCssVariables.accent.accent9}
          height={40}
          rx={8}
          width={40}
        />
      )}
      <path
        d={ZYRA_MARK_OUTLINE}
        stroke={lineColor}
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
      {ZYRA_MARK_FACETS.map(([from, to]) => {
        const [x1, y1] = from.split(' ');
        const [x2, y2] = to.split(' ');
        return (
          <line
            key={`${from}-${to}`}
            stroke={lineColor}
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
