"use client";

import type { UCATChartVisual } from "../_lib/ucatQuestionBank";

const SUPERSCRIPT_DIGITS: Record<"2" | "3", string> = {
  "2": "²",
  "3": "³",
};

export function formatDisplayText(value: string) {
  return value.replace(
    /\b(mm|cm|km|m|in|ft|yd|mi)\^?([23])\b/g,
    (_match, unit: string, power: string) =>
      `${unit}${SUPERSCRIPT_DIGITS[power as "2" | "3"]}`
  );
}

export type SetDiagramVisual = Extract<UCATChartVisual, { type: "set-diagram" }>;
export type SetDiagramShape = SetDiagramVisual["shapes"][number];

export function getSetShapePoints(shape: SetDiagramShape) {
  const { x, y, width: shapeWidth, height: shapeHeight } = shape;

  if (shape.shape === "triangle") {
    return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight} ${x},${y + shapeHeight}`;
  }

  if (shape.shape === "diamond") {
    return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth / 2},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
  }

  if (shape.shape === "hexagon") {
    return `${x + shapeWidth * 0.25},${y} ${x + shapeWidth * 0.75},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth * 0.75},${y + shapeHeight} ${x + shapeWidth * 0.25},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
  }

  return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight * 0.38} ${x + shapeWidth * 0.82},${y + shapeHeight} ${x + shapeWidth * 0.18},${y + shapeHeight} ${x},${y + shapeHeight * 0.38}`;
}

export function SetDiagramShapeElement({
  shape,
  strokeWidth,
}: {
  shape: SetDiagramShape;
  strokeWidth: number;
}) {
  const centerX = shape.x + shape.width / 2;
  const centerY = shape.y + shape.height / 2;
  const transform = shape.rotation
    ? `rotate(${shape.rotation} ${centerX} ${centerY})`
    : undefined;

  if (shape.shape === "circle") {
    return (
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={shape.width / 2}
        ry={shape.height / 2}
        transform={transform}
        fill="rgba(255,255,255,0.45)"
        stroke="#111827"
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.shape === "rectangle") {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        transform={transform}
        fill="rgba(255,255,255,0.45)"
        stroke="#111827"
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <polygon
      points={getSetShapePoints(shape)}
      transform={transform}
      fill="rgba(255,255,255,0.45)"
      stroke="#111827"
      strokeWidth={strokeWidth}
    />
  );
}

export function OptionVisual({ visual }: { visual: UCATChartVisual }) {
  if (visual.type !== "set-diagram") return null;

  const padding = 16;
  const rightEdge = Math.max(
    320,
    ...visual.shapes.map((shape) => shape.x + shape.width),
    ...visual.regionLabels.map((label) => label.x)
  );
  const bottomEdge = Math.max(
    240,
    ...visual.shapes.map((shape) => shape.y + shape.height),
    ...visual.regionLabels.map((label) => label.y)
  );
  const width = Math.ceil(rightEdge + padding);
  const height = Math.ceil(bottomEdge + padding);

  return (
    <div className="mt-2 w-full max-w-[300px] rounded-sm border border-slate-300 bg-white p-1.5">
      <p className="text-center text-[11px] font-bold leading-4 text-slate-900">
        {formatDisplayText(visual.title)}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-1 h-auto w-full text-slate-800"
        role="img"
        aria-label={formatDisplayText(visual.title)}
      >
        {visual.shapes.map((shape) => (
          <SetDiagramShapeElement key={shape.id} shape={shape} strokeWidth={1.7} />
        ))}
        {visual.regionLabels.map((label) => (
          <g key={label.id}>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="700"
              fill="#111827"
            >
              {label.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatChartNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(/\.0$/, "");
}

function splitSvgLabel(value: string, maxChars: number) {
  const words = formatDisplayText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = "";
      }

      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function WrappedSvgLabel({
  lines,
  x,
  y,
  fontSize,
  fontWeight = 700,
  lineHeight = 14,
}: {
  lines: string[];
  x: number;
  y: number;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="hanging"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill="#111111"
    >
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export type ChartPatternKind =
  | "solid"
  | "diagonal"
  | "horizontal"
  | "vertical"
  | "dots"
  | "crosshatch";
export type LinePointShape = "circle" | "square" | "diamond";
export type QuestionChartVariant = {
  id: string;
  chartWidthOffset: number;
  chartHeight: number;
  top: number;
  right: number;
  tickCount: number;
  gridStroke: string;
  gridDasharray?: string;
  axisStrokeWidth: number;
  dataStrokeWidth: number;
  barCornerRadius: number;
  barGapScale: number;
  valueFontSize: number;
  labelFontSize: number;
  labelCharDivisor: number;
  fills: string[];
  patterns: ChartPatternKind[];
  lineStroke: string;
  lineStrokeWidth: number;
  lineDasharray?: string;
  linePointShape: LinePointShape;
  linePointRadius: number;
  pieWidth: number;
  pieHeight: number;
  pieRadius: number;
  pieStartAngle: number;
  pieLabelOffset: number;
  pieCenterOffset: number;
};

const QUESTION_CHART_VARIANTS: Array<Omit<QuestionChartVariant, "id">> = [
  {
    chartWidthOffset: 0,
    chartHeight: 230,
    top: 52,
    right: 30,
    tickCount: 5,
    gridStroke: "#b7b7b7",
    axisStrokeWidth: 2.2,
    dataStrokeWidth: 2,
    barCornerRadius: 0,
    barGapScale: 1,
    valueFontSize: 14,
    labelFontSize: 14,
    labelCharDivisor: 5.8,
    fills: ["#ffffff", "#c7c7c7", "#ececec", "#9f9f9f"],
    patterns: ["solid", "solid", "solid", "solid"],
    lineStroke: "#3d3d3d",
    lineStrokeWidth: 4,
    linePointShape: "circle",
    linePointRadius: 8,
    pieWidth: 620,
    pieHeight: 380,
    pieRadius: 112,
    pieStartAngle: -90,
    pieLabelOffset: 60,
    pieCenterOffset: 0,
  },
  {
    chartWidthOffset: -36,
    chartHeight: 210,
    top: 48,
    right: 42,
    tickCount: 4,
    gridStroke: "#d4d4d4",
    gridDasharray: "4 5",
    axisStrokeWidth: 1.8,
    dataStrokeWidth: 1.8,
    barCornerRadius: 0,
    barGapScale: 1.3,
    valueFontSize: 13,
    labelFontSize: 13,
    labelCharDivisor: 6.3,
    fills: ["#f9f9f9", "#d0d0d0", "#ededed", "#9d9d9d"],
    patterns: ["diagonal", "solid", "horizontal", "dots"],
    lineStroke: "#111111",
    lineStrokeWidth: 3.2,
    lineDasharray: "9 5",
    linePointShape: "square",
    linePointRadius: 7,
    pieWidth: 590,
    pieHeight: 360,
    pieRadius: 102,
    pieStartAngle: -35,
    pieLabelOffset: 62,
    pieCenterOffset: -12,
  },
  {
    chartWidthOffset: 24,
    chartHeight: 250,
    top: 58,
    right: 34,
    tickCount: 5,
    gridStroke: "#c9c9c9",
    axisStrokeWidth: 2.5,
    dataStrokeWidth: 2.3,
    barCornerRadius: 2,
    barGapScale: 0.85,
    valueFontSize: 15,
    labelFontSize: 14,
    labelCharDivisor: 5.5,
    fills: ["#ffffff", "#bcbcbc", "#e7e7e7", "#777777"],
    patterns: ["vertical", "crosshatch", "solid", "diagonal"],
    lineStroke: "#555555",
    lineStrokeWidth: 4.5,
    linePointShape: "diamond",
    linePointRadius: 8,
    pieWidth: 650,
    pieHeight: 398,
    pieRadius: 122,
    pieStartAngle: 0,
    pieLabelOffset: 68,
    pieCenterOffset: 8,
  },
  {
    chartWidthOffset: 54,
    chartHeight: 220,
    top: 46,
    right: 50,
    tickCount: 6,
    gridStroke: "#dedede",
    gridDasharray: "2 6",
    axisStrokeWidth: 1.6,
    dataStrokeWidth: 2.6,
    barCornerRadius: 0,
    barGapScale: 1.05,
    valueFontSize: 13,
    labelFontSize: 13,
    labelCharDivisor: 6,
    fills: ["#eeeeee", "#ffffff", "#adadad", "#d8d8d8"],
    patterns: ["horizontal", "diagonal", "solid", "dots"],
    lineStroke: "#222222",
    lineStrokeWidth: 2.8,
    lineDasharray: "3 5",
    linePointShape: "circle",
    linePointRadius: 6.5,
    pieWidth: 670,
    pieHeight: 390,
    pieRadius: 108,
    pieStartAngle: -125,
    pieLabelOffset: 72,
    pieCenterOffset: 20,
  },
  {
    chartWidthOffset: -10,
    chartHeight: 240,
    top: 56,
    right: 28,
    tickCount: 5,
    gridStroke: "#bdbdbd",
    axisStrokeWidth: 2,
    dataStrokeWidth: 1.7,
    barCornerRadius: 3,
    barGapScale: 1.15,
    valueFontSize: 14,
    labelFontSize: 13,
    labelCharDivisor: 5.9,
    fills: ["#ffffff", "#d9d9d9", "#8f8f8f", "#f3f3f3"],
    patterns: ["dots", "solid", "crosshatch", "vertical"],
    lineStroke: "#111111",
    lineStrokeWidth: 3.5,
    linePointShape: "square",
    linePointRadius: 6.5,
    pieWidth: 630,
    pieHeight: 370,
    pieRadius: 116,
    pieStartAngle: -65,
    pieLabelOffset: 58,
    pieCenterOffset: -4,
  },
];

function stableChartHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getQuestionChartVariant(visual: UCATChartVisual): QuestionChartVariant {
  const hash = stableChartHash(`${visual.type}:${visual.title}`);
  const variant = QUESTION_CHART_VARIANTS[hash % QUESTION_CHART_VARIANTS.length];

  return {
    id: `qrchart-${hash.toString(36)}`,
    ...variant,
  };
}

export function getChartPatternKind(
  variant: QuestionChartVariant,
  index: number
): ChartPatternKind {
  return variant.patterns[index % variant.patterns.length];
}

export function getChartBaseFill(variant: QuestionChartVariant, index: number) {
  return variant.fills[index % variant.fills.length];
}

export function getChartPatternId(variant: QuestionChartVariant, index: number) {
  return `${variant.id}-fill-${index}`;
}

export function getChartSvgFill(variant: QuestionChartVariant, index: number) {
  const pattern = getChartPatternKind(variant, index);
  return pattern === "solid"
    ? getChartBaseFill(variant, index)
    : `url(#${getChartPatternId(variant, index)})`;
}

export function ChartPatternMark({ kind }: { kind: ChartPatternKind }) {
  const stroke = "#4a4a4a";

  if (kind === "diagonal") {
    return (
      <>
        <line x1="-2" y1="8" x2="8" y2="-2" stroke={stroke} strokeWidth="1" />
        <line x1="4" y1="10" x2="10" y2="4" stroke={stroke} strokeWidth="1" />
      </>
    );
  }

  if (kind === "horizontal") {
    return (
      <>
        <line x1="0" y1="2" x2="8" y2="2" stroke={stroke} strokeWidth="1" />
        <line x1="0" y1="6" x2="8" y2="6" stroke={stroke} strokeWidth="1" />
      </>
    );
  }

  if (kind === "vertical") {
    return (
      <>
        <line x1="2" y1="0" x2="2" y2="8" stroke={stroke} strokeWidth="1" />
        <line x1="6" y1="0" x2="6" y2="8" stroke={stroke} strokeWidth="1" />
      </>
    );
  }

  if (kind === "dots") {
    return (
      <>
        <circle cx="2" cy="2" r="0.9" fill={stroke} />
        <circle cx="6" cy="6" r="0.9" fill={stroke} />
      </>
    );
  }

  if (kind === "crosshatch") {
    return (
      <>
        <line x1="-2" y1="8" x2="8" y2="-2" stroke={stroke} strokeWidth="0.9" />
        <line x1="0" y1="0" x2="8" y2="8" stroke={stroke} strokeWidth="0.9" />
      </>
    );
  }

  return null;
}

export function ChartPatternDefs({
  variant,
  count,
}: {
  variant: QuestionChartVariant;
  count: number;
}) {
  return (
    <defs>
      {Array.from({ length: count }, (_, index) => {
        const pattern = getChartPatternKind(variant, index);

        if (pattern === "solid") return null;

        return (
          <pattern
            key={getChartPatternId(variant, index)}
            id={getChartPatternId(variant, index)}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={getChartBaseFill(variant, index)} />
            <ChartPatternMark kind={pattern} />
          </pattern>
        );
      })}
    </defs>
  );
}

export function getLegendSwatchStyle(kind: ChartPatternKind, fill: string) {
  const ink = "rgba(17, 17, 17, 0.5)";

  if (kind === "diagonal") {
    return {
      backgroundColor: fill,
      backgroundImage: `repeating-linear-gradient(135deg, transparent 0 4px, ${ink} 4px 5px)`,
    };
  }

  if (kind === "horizontal") {
    return {
      backgroundColor: fill,
      backgroundImage: `repeating-linear-gradient(0deg, transparent 0 4px, ${ink} 4px 5px)`,
    };
  }

  if (kind === "vertical") {
    return {
      backgroundColor: fill,
      backgroundImage: `repeating-linear-gradient(90deg, transparent 0 4px, ${ink} 4px 5px)`,
    };
  }

  if (kind === "dots") {
    return {
      backgroundColor: fill,
      backgroundImage: `radial-gradient(${ink} 1px, transparent 1.2px)`,
      backgroundSize: "6px 6px",
    };
  }

  if (kind === "crosshatch") {
    return {
      backgroundColor: fill,
      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 4px, ${ink} 4px 5px), repeating-linear-gradient(135deg, transparent 0 4px, ${ink} 4px 5px)`,
    };
  }

  return { backgroundColor: fill };
}

export function LinePointMarker({
  x,
  y,
  variant,
}: {
  x: number;
  y: number;
  variant: QuestionChartVariant;
}) {
  const radius = variant.linePointRadius;
  const strokeWidth = Math.max(2, variant.dataStrokeWidth);

  if (variant.linePointShape === "square") {
    return (
      <rect
        x={x - radius}
        y={y - radius}
        width={radius * 2}
        height={radius * 2}
        fill="#ffffff"
        stroke="#111111"
        strokeWidth={strokeWidth}
      />
    );
  }

  if (variant.linePointShape === "diamond") {
    return (
      <polygon
        points={`${x},${y - radius} ${x + radius},${y} ${x},${y + radius} ${
          x - radius
        },${y}`}
        fill="#ffffff"
        stroke="#111111"
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={radius}
      fill="#ffffff"
      stroke="#111111"
      strokeWidth={strokeWidth}
    />
  );
}

export function QuestionVisual({ visual }: { visual: UCATChartVisual }) {
  if (visual.type === "table") {
    return (
      <div className="mx-auto mb-8 mt-5 w-full max-w-[720px] overflow-x-auto bg-white">
        <table className="min-w-[540px] border-collapse text-center text-sm text-black">
          <caption className="mb-2 text-center text-base font-bold text-black">
            {formatDisplayText(visual.title)}
          </caption>
          <thead>
            <tr>
              {visual.headers.map((header) => (
                <th
                  key={header}
                  className="border border-black px-3 py-1.5 align-middle font-bold leading-5"
                >
                  {formatDisplayText(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell) => (
                  <td
                    key={cell}
                    className="border border-black px-3 py-1.5 align-middle leading-5"
                  >
                    {formatDisplayText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visual.note && (
          <p className="mt-2 text-xs font-semibold text-black">
            {formatDisplayText(visual.note)}
          </p>
        )}
      </div>
    );
  }

  if (visual.type === "set-diagram") {
    const diagramPadding = 24;
    const rightEdge = Math.max(
      496,
      ...visual.shapes.map((shape) => shape.x + shape.width),
      ...visual.regionLabels.map((label) => label.x)
    );
    const bottomEdge = Math.max(
      336,
      ...visual.shapes.map((shape) => shape.y + shape.height),
      ...visual.regionLabels.map((label) => label.y)
    );
    const width = Math.ceil(rightEdge + diagramPadding);
    const height = Math.ceil(bottomEdge + diagramPadding);
    const shapePoints = (shape: (typeof visual.shapes)[number]) => {
      const { x, y, width: shapeWidth, height: shapeHeight } = shape;

      if (shape.shape === "triangle") {
        return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight} ${x},${y + shapeHeight}`;
      }

      if (shape.shape === "diamond") {
        return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth / 2},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
      }

      if (shape.shape === "hexagon") {
        return `${x + shapeWidth * 0.25},${y} ${x + shapeWidth * 0.75},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth * 0.75},${y + shapeHeight} ${x + shapeWidth * 0.25},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
      }

      return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight * 0.38} ${x + shapeWidth * 0.82},${y + shapeHeight} ${x + shapeWidth * 0.18},${y + shapeHeight} ${x},${y + shapeHeight * 0.38}`;
    };

    return (
      <div className="mx-auto mb-8 mt-5 w-full max-w-[560px] rounded-sm border border-slate-300 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
        <h3 className="text-center text-sm font-bold">{formatDisplayText(visual.title)}</h3>
        <div className="mt-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full min-w-[320px] max-w-full text-slate-800"
            role="img"
            aria-label={formatDisplayText(visual.title)}
          >
            {visual.shapes.map((shape) => {
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;
              const transform = shape.rotation
                ? `rotate(${shape.rotation} ${centerX} ${centerY})`
                : undefined;

              if (shape.shape === "circle") {
                return (
                  <ellipse
                    key={shape.id}
                    cx={centerX}
                    cy={centerY}
                    rx={shape.width / 2}
                    ry={shape.height / 2}
                    transform={transform}
                    fill="rgba(255,255,255,0.45)"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                );
              }

              if (shape.shape === "rectangle") {
                return (
                  <rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    transform={transform}
                    fill="rgba(255,255,255,0.45)"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                );
              }

              return (
                <polygon
                  key={shape.id}
                  points={shapePoints(shape)}
                  transform={transform}
                  fill="rgba(255,255,255,0.45)"
                  stroke="#111827"
                  strokeWidth="2"
                />
              );
            })}
            {visual.regionLabels.map((label) => (
              <g key={label.id}>
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#111827"
                >
                  {label.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {visual.note && (
          <p className="mt-2 text-xs font-semibold text-slate-600">
            {formatDisplayText(visual.note)}
          </p>
        )}
      </div>
    );
  }

  if (visual.type === "pie") {
    const variant = getQuestionChartVariant(visual);
    const total = visual.slices.reduce((sum, slice) => sum + slice.value, 0);
    const width = variant.pieWidth;
    const height = variant.pieHeight;
    const centerX = width / 2 + variant.pieCenterOffset;
    const centerY = height / 2;
    const radius = variant.pieRadius;
    const labelRadius = radius + variant.pieLabelOffset;
    const toPoint = (angle: number, pointRadius: number) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + Math.cos(radians) * pointRadius,
        y: centerY + Math.sin(radians) * pointRadius,
      };
    };
    const slices = visual.slices.map((slice, index) => {
      const previousTotal = visual.slices
        .slice(0, index)
        .reduce((sum, previousSlice) => sum + previousSlice.value, 0);
      const sliceAngle = total > 0 ? (slice.value / total) * 360 : 0;
      const startAngle =
        total > 0
          ? variant.pieStartAngle + (previousTotal / total) * 360
          : variant.pieStartAngle;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      const start = toPoint(startAngle, radius);
      const end = toPoint(endAngle, radius);
      const labelPoint = toPoint(midAngle, labelRadius);
      const leaderStart = toPoint(midAngle, radius + 8);
      const leaderEnd = toPoint(midAngle, labelRadius - 18);
      const largeArc = sliceAngle > 180 ? 1 : 0;
      const path =
        sliceAngle >= 359.99
          ? undefined
          : `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
      const percentage = total > 0 ? (slice.value / total) * 100 : 0;
      const anchor: "start" | "middle" | "end" =
        labelPoint.x > centerX + 12
          ? "start"
          : labelPoint.x < centerX - 12
            ? "end"
            : "middle";
      return {
        ...slice,
        index,
        path,
        percentage,
        labelPoint,
        leaderStart,
        leaderEnd,
        anchor,
      };
    });

    return (
      <div className="mx-auto mb-8 mt-5 w-full max-w-[720px] bg-white text-black">
        <h3 className="text-center text-base font-bold text-black">
          {formatDisplayText(visual.title)}
        </h3>
        <div className="mt-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto text-black"
            style={{ width: `${width}px`, maxWidth: "none" }}
            role="img"
            aria-label={formatDisplayText(visual.title)}
          >
            <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
            <ChartPatternDefs variant={variant} count={visual.slices.length} />
            {slices.map((slice) =>
              slice.path ? (
                <path
                  key={slice.label}
                  d={slice.path}
                  fill={getChartSvgFill(variant, slice.index)}
                  stroke="#111111"
                  strokeWidth={variant.dataStrokeWidth}
                />
              ) : (
                <circle
                  key={slice.label}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={getChartSvgFill(variant, slice.index)}
                  stroke="#111111"
                  strokeWidth={variant.dataStrokeWidth}
                />
              )
            )}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#111111"
              strokeWidth={variant.axisStrokeWidth}
            />
            {slices.map((slice) => (
              <g key={`${slice.label}-label`}>
                <line
                  x1={slice.leaderStart.x}
                  y1={slice.leaderStart.y}
                  x2={slice.leaderEnd.x}
                  y2={slice.leaderEnd.y}
                  stroke="#111111"
                  strokeWidth={Math.max(1.2, variant.axisStrokeWidth - 0.8)}
                />
                <text
                  x={slice.labelPoint.x}
                  y={slice.labelPoint.y - 8}
                  textAnchor={slice.anchor}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={variant.labelFontSize}
                  fontWeight="700"
                  fill="#111111"
                >
                  {formatDisplayText(slice.label)}
                </text>
                <text
                  x={slice.labelPoint.x}
                  y={slice.labelPoint.y + 10}
                  textAnchor={slice.anchor}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={variant.labelFontSize}
                  fill="#111111"
                >
                  {formatChartNumber(slice.value)} (
                  {slice.percentage.toFixed(slice.percentage % 1 === 0 ? 0 : 1)}%)
                </text>
              </g>
            ))}
          </svg>
        </div>
        {visual.note && (
          <p className="mt-2 text-xs font-semibold text-black">
            {formatDisplayText(visual.note)}
          </p>
        )}
      </div>
    );
  }

  const variant = getQuestionChartVariant(visual);
  const getSeriesFill = (index: number) => getChartSvgFill(variant, index);

  const xAxisLabels =
    visual.type === "bar"
      ? visual.categories.map((category) => category.label)
      : visual.type === "grouped-bar"
        ? visual.groups.map((group) => group.label)
        : visual.points.map((point) => point.label);
  const width =
    (visual.type === "grouped-bar" ? 660 : 620) + variant.chartWidthOffset;
  const top = variant.top;
  const right = variant.right;
  const chartHeight = variant.chartHeight;
  const tickCount = variant.tickCount;
  const ticks = Array.from(
    { length: tickCount + 1 },
    (_, index) => (visual.max / tickCount) * index
  );
  const tickLabels = ticks.map(formatChartNumber);
  const left = Math.max(
    84,
    Math.max(...tickLabels.map((label) => label.length)) * 8 + 44
  );
  const chartWidth = width - left - right;
  const labelSlotWidth = chartWidth / Math.max(1, xAxisLabels.length);
  const labelMaxChars = Math.max(
    6,
    Math.floor(labelSlotWidth / variant.labelCharDivisor)
  );
  const xAxisLabelLines = xAxisLabels.map((label) =>
    splitSvgLabel(label, labelMaxChars)
  );
  const maxXAxisLines = Math.max(
    1,
    ...xAxisLabelLines.map((lines) => lines.length)
  );
  const bottom = 42 + maxXAxisLines * 15;
  const height = top + chartHeight + bottom;
  const axisBottom = top + chartHeight;
  const valueToY = (value: number) =>
    axisBottom - (value / visual.max) * chartHeight;
  const linePoints =
    visual.type === "line"
      ? visual.points.map((point, index) => {
          const x =
            left +
            (visual.points.length === 1
              ? chartWidth / 2
              : (index / (visual.points.length - 1)) * chartWidth);
          return { ...point, x, y: valueToY(point.value) };
        })
      : [];
  const groupedLegendItems =
    visual.type === "grouped-bar"
      ? visual.seriesLabels.map((label, index) => ({
          label,
          baseFill: getChartBaseFill(variant, index),
          pattern: getChartPatternKind(variant, index),
        }))
      : [];

  return (
    <div className="mx-auto mb-8 mt-5 w-full max-w-[720px] bg-white text-black">
      <h3 className="text-center text-base font-bold text-black">
        {formatDisplayText(visual.title)}
      </h3>
      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto text-black"
          style={{ width: `${width}px`, maxWidth: "none" }}
          role="img"
          aria-label={formatDisplayText(visual.title)}
        >
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
          <ChartPatternDefs
            variant={variant}
            count={
              visual.type === "bar"
                ? visual.categories.length
                : visual.type === "grouped-bar"
                  ? visual.seriesLabels.length
                  : 0
            }
          />
          {ticks.map((tick) => {
            const y = valueToY(tick);
            return (
              <g key={tick}>
                <line
                  x1={left}
                  y1={y}
                  x2={left + chartWidth}
                  y2={y}
                  stroke={variant.gridStroke}
                  strokeWidth="1.2"
                  strokeDasharray={variant.gridDasharray}
                />
                <text
                  x={left - 14}
                  y={y + 5}
                  textAnchor="end"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={variant.labelFontSize}
                  fill="#111111"
                >
                  {formatChartNumber(tick)}
                </text>
              </g>
            );
          })}
          <line
            x1={left}
            y1={axisBottom}
            x2={left + chartWidth}
            y2={axisBottom}
            stroke="#111111"
            strokeWidth={variant.axisStrokeWidth}
          />
          <line
            x1={left}
            y1={top}
            x2={left}
            y2={axisBottom}
            stroke="#111111"
            strokeWidth={variant.axisStrokeWidth}
          />
          <text
            x={24}
            y={top + chartHeight / 2}
            transform={`rotate(-90 24 ${top + chartHeight / 2})`}
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={variant.labelFontSize + 1}
            fontWeight="700"
            fill="#111111"
          >
            {formatDisplayText(visual.yLabel)}
          </text>

          {visual.type === "bar" &&
            visual.categories.map((category, index) => {
              const baseGap = Math.max(
                10,
                Math.min(24, chartWidth / (visual.categories.length * 3))
              );
              const gap = Math.max(
                8,
                Math.min(34, baseGap * variant.barGapScale)
              );
              const barWidth =
                (chartWidth - gap * (visual.categories.length + 1)) /
                visual.categories.length;
              const x = left + gap + index * (barWidth + gap);
              const y = valueToY(category.value);
              const barHeight = axisBottom - y;
              return (
                <g key={category.label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={variant.barCornerRadius}
                    ry={variant.barCornerRadius}
                    fill={getSeriesFill(index)}
                    stroke="#111111"
                    strokeWidth={variant.dataStrokeWidth}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(top + 14, y - 8)}
                    textAnchor="middle"
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize={variant.valueFontSize}
                    fontWeight="700"
                    fill="#111111"
                  >
                    {formatChartNumber(category.value)}
                  </text>
                  <WrappedSvgLabel
                    lines={xAxisLabelLines[index]}
                    x={x + barWidth / 2}
                    y={axisBottom + 18}
                    fontSize={variant.labelFontSize}
                    lineHeight={15}
                  />
                </g>
              );
            })}

          {visual.type === "grouped-bar" &&
            visual.groups.map((group, groupIndex) => {
              const baseGroupGap = Math.max(
                18,
                Math.min(34, chartWidth / (visual.groups.length * 4))
              );
              const groupGap = Math.max(
                14,
                Math.min(42, baseGroupGap * variant.barGapScale)
              );
              const seriesCount = Math.max(1, visual.seriesLabels.length);
              const groupWidth =
                (chartWidth - groupGap * (visual.groups.length + 1)) /
                visual.groups.length;
              const barGap = 4;
              const barWidth =
                (groupWidth - barGap * (seriesCount - 1)) / seriesCount;
              const x = left + groupGap + groupIndex * (groupWidth + groupGap);

              return (
                <g key={group.label}>
                  {group.values.map((value, valueIndex) => {
                    const barX = x + valueIndex * (barWidth + barGap);
                    const y = valueToY(value);
                    const barHeight = axisBottom - y;
                    return (
                      <rect
                        key={`${group.label}-${visual.seriesLabels[valueIndex]}`}
                        x={barX}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={variant.barCornerRadius}
                        ry={variant.barCornerRadius}
                        fill={getSeriesFill(valueIndex)}
                        stroke="#111111"
                        strokeWidth={variant.dataStrokeWidth}
                      />
                    );
                  })}
                  <WrappedSvgLabel
                    lines={xAxisLabelLines[groupIndex]}
                    x={x + groupWidth / 2}
                    y={axisBottom + 18}
                    fontSize={variant.labelFontSize}
                    lineHeight={15}
                  />
                </g>
              );
            })}

          {visual.type === "line" && (
            <>
              <polyline
                points={linePoints.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke={variant.lineStroke}
                strokeWidth={variant.lineStrokeWidth}
                strokeDasharray={variant.lineDasharray}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {linePoints.map((point, index) => (
                <g key={point.label}>
                  <LinePointMarker x={point.x} y={point.y} variant={variant} />
                  <text
                    x={point.x}
                    y={Math.max(top + 16, point.y - 14)}
                    textAnchor="middle"
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize={variant.valueFontSize}
                    fontWeight="700"
                    fill="#111111"
                  >
                    {formatChartNumber(point.value)}
                  </text>
                  <WrappedSvgLabel
                    lines={xAxisLabelLines[index]}
                    x={point.x}
                    y={axisBottom + 18}
                    fontSize={variant.labelFontSize}
                    lineHeight={15}
                  />
                </g>
              ))}
            </>
          )}
        </svg>
      </div>
      {groupedLegendItems.length > 0 && (
        <div
          className="mx-auto mt-2 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-black"
          style={{ width: `${width}px`, maxWidth: "100%" }}
        >
          {groupedLegendItems.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span
                className="h-4 w-7 border border-black"
                style={getLegendSwatchStyle(item.pattern, item.baseFill)}
                aria-hidden="true"
              />
              {formatDisplayText(item.label)}
            </span>
          ))}
        </div>
      )}
      {visual.note && (
        <p className="mt-2 text-xs font-semibold text-black">
          {formatDisplayText(visual.note)}
        </p>
      )}
    </div>
  );
}
