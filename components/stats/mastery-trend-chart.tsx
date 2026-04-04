"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; mastered: number };

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
      <p className="text-success font-medium">{payload[0].value} cards mastered</p>
    </div>
  );
}

export function MasteryTrendChart({ data }: Props) {
  const hasData = data.some((d) => d.mastered > 0);

  if (!hasData) {
    return (
      <p className="py-6 text-center text-sm text-on-surface-variant">
        No mastery data yet. Cards are mastered after 21+ day intervals.
      </p>
    );
  }

  const ticks = data
    .filter((_, i) => i % 7 === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="masteryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--success)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="mastered"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#masteryGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--success)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
