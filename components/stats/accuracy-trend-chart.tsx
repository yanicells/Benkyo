"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type DataPoint = { date: string; accuracy: number };

type Props = {
  data: DataPoint[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-surface-lowest border border-outline-variant px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label ? formatDate(label) : ""}</p>
      <p className="text-primary font-medium">{payload[0].value}% accuracy</p>
    </div>
  );
}

export function AccuracyTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-on-surface-variant">
        No accuracy data yet. Data appears after your first review session.
      </p>
    );
  }

  const ticks = data
    .filter((_, i) => i % 7 === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--outline-variant)" strokeOpacity={0.5} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={formatDate}
          tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={80} stroke="var(--success)" strokeDasharray="4 3" strokeOpacity={0.6} />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--primary)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
