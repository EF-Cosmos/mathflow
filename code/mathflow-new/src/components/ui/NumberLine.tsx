/**
 * NumberLine Component
 *
 * SVG number line visualization for inequality solution intervals.
 * Renders filled regions for solution sets with open/closed boundary circles.
 */

interface Interval {
  lower: number | null;   // null = -infinity
  upper: number | null;   // null = +infinity
  lower_strict: boolean;  // true = open circle (not included)
  upper_strict: boolean;  // true = open circle (not included)
}

interface NumberLineProps {
  intervals: Interval[];
}

export default function NumberLine({ intervals }: NumberLineProps) {
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 60;
  const PADDING = 20;
  const USABLE_WIDTH = SVG_WIDTH - 2 * PADDING; // 360
  const LINE_Y = 30;
  const FILL_HEIGHT = 10;

  // Collect all bounded endpoints
  const boundedEndpoints: number[] = [];
  for (const interval of intervals) {
    if (interval.lower !== null) boundedEndpoints.push(interval.lower);
    if (interval.upper !== null) boundedEndpoints.push(interval.upper);
  }

  // Determine view range
  let viewMin: number;
  let viewMax: number;

  if (boundedEndpoints.length > 0) {
    const minEndpoint = Math.min(...boundedEndpoints);
    const maxEndpoint = Math.max(...boundedEndpoints);
    viewMin = minEndpoint - 2;
    viewMax = maxEndpoint + 2;
  } else {
    // No bounded endpoints (e.g., x > 2 with no upper bound)
    viewMin = -5;
    viewMax = 10;
  }

  // Prevent zero-range (edge case where all endpoints are the same)
  if (viewMax - viewMin < 1) {
    const center = (viewMin + viewMax) / 2;
    viewMin = center - 2;
    viewMax = center + 2;
  }

  // Map a real number to SVG x coordinate
  const mapX = (value: number): number => {
    return PADDING + ((value - viewMin) / (viewMax - viewMin)) * USABLE_WIDTH;
  };

  // Format number for label display
  const formatLabel = (value: number): string => {
    if (Number.isInteger(value)) return value.toString();
    // Show up to 2 decimal places, strip trailing zeros
    const formatted = value.toFixed(2).replace(/\.?0+$/, '');
    return formatted;
  };

  // Handle special cases
  const isAllReals = intervals.length === 1
    && intervals[0].lower === null
    && intervals[0].upper === null;

  const isNoSolution = intervals.length === 0;

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width="100%"
      height={SVG_HEIGHT}
      className="block"
      role="img"
      aria-label={isNoSolution ? 'No solution' : 'Solution number line'}
    >
      {/* Base horizontal line */}
      <line
        x1={PADDING - 6}
        y1={LINE_Y}
        x2={SVG_WIDTH - PADDING + 6}
        y2={LINE_Y}
        stroke="#9ca3af"
        strokeWidth={1.5}
      />

      {/* Left arrowhead */}
      <polygon
        points={`${PADDING - 6},${LINE_Y} ${PADDING - 1},${LINE_Y - 4} ${PADDING - 1},${LINE_Y + 4}`}
        fill="#9ca3af"
      />

      {/* Right arrowhead */}
      <polygon
        points={`${SVG_WIDTH - PADDING + 6},${LINE_Y} ${SVG_WIDTH - PADDING + 1},${LINE_Y - 4} ${SVG_WIDTH - PADDING + 1},${LINE_Y + 4}`}
        fill="#9ca3af"
      />

      {isNoSolution ? (
        /* No solution: show line only with "无解" text */
        <text
          x={SVG_WIDTH / 2}
          y={50}
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
          fontSize={12}
        >
          无解
        </text>
      ) : isAllReals ? (
        <>
          {/* All reals: fill entire line */}
          <rect
            x={PADDING}
            y={LINE_Y - FILL_HEIGHT / 2}
            width={USABLE_WIDTH}
            height={FILL_HEIGHT}
            fill="rgba(22, 163, 74, 0.2)"
          />
          <text
            x={SVG_WIDTH / 2}
            y={50}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
            fontSize={12}
          >
            解为全体实数
          </text>
        </>
      ) : (
        <>
          {/* Normal case: draw intervals */}
          {intervals.map((interval, i) => {
            const x1 = interval.lower !== null ? mapX(interval.lower) : PADDING;
            const x2 = interval.upper !== null ? mapX(interval.upper) : SVG_WIDTH - PADDING;
            const width = x2 - x1;

            return (
              <rect
                key={`fill-${i}`}
                x={x1}
                y={LINE_Y - FILL_HEIGHT / 2}
                width={width}
                height={FILL_HEIGHT}
                fill="rgba(22, 163, 74, 0.2)"
              />
            );
          })}

          {/* Tick marks and boundary circles */}
          {intervals.map((interval, i) => {
            const elements: React.ReactElement[] = [];
            const key = `interval-${i}`;

            // Lower boundary
            if (interval.lower !== null) {
              const x = mapX(interval.lower);
              const isOpen = interval.lower_strict;
              const fill = isOpen ? 'white' : 'rgb(22, 163, 74)';
              const stroke = 'rgb(22, 163, 74)';

              elements.push(
                <g key={`${key}-lower`}>
                  {/* Tick mark */}
                  <line
                    x1={x}
                    y1={LINE_Y - 8}
                    x2={x}
                    y2={LINE_Y + 8}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={LINE_Y}
                    r={5}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                  />
                  {/* Numeric label */}
                  <text
                    x={x}
                    y={LINE_Y + 22}
                    textAnchor="middle"
                    className="fill-gray-600 dark:fill-gray-300"
                    fontSize={11}
                  >
                    {formatLabel(interval.lower)}
                  </text>
                </g>
              );
            }

            // Upper boundary
            if (interval.upper !== null) {
              const x = mapX(interval.upper);
              const isOpen = interval.upper_strict;
              const fill = isOpen ? 'white' : 'rgb(22, 163, 74)';
              const stroke = 'rgb(22, 163, 74)';

              elements.push(
                <g key={`${key}-upper`}>
                  {/* Tick mark */}
                  <line
                    x1={x}
                    y1={LINE_Y - 8}
                    x2={x}
                    y2={LINE_Y + 8}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={LINE_Y}
                    r={5}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                  />
                  {/* Numeric label */}
                  <text
                    x={x}
                    y={LINE_Y + 22}
                    textAnchor="middle"
                    className="fill-gray-600 dark:fill-gray-300"
                    fontSize={11}
                  >
                    {formatLabel(interval.upper)}
                  </text>
                </g>
              );
            }

            return elements;
          })}
        </>
      )}
    </svg>
  );
}
