"use client";

type AccuracyChartProps = {
  data: { date: string; accuracy: number }[];
};

export function AccuracyChart({ data }: AccuracyChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xStep = data.length > 1 ? innerW / (data.length - 1) : innerW / 2;

  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + innerH - (d.accuracy / 100) * innerH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[400px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = padding.top + innerH - (pct / 100) * innerH;
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e5e9"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-on-surface-variant text-[10px]"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#002446"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#002446"
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* X-axis labels (show a few) */}
        {points
          .filter(
            (_, i) =>
              i === 0 ||
              i === points.length - 1 ||
              (points.length > 7 && i % Math.ceil(points.length / 5) === 0),
          )
          .map((p) => (
            <text
              key={p.date}
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="fill-on-surface-variant text-[9px]"
            >
              {p.date.slice(5)}
            </text>
          ))}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#002446" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#002446" stopOpacity={0.02} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
