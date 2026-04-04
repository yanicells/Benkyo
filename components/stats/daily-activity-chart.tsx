"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; reviewed: number; correct: number };

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
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const reviewed = payload.find((p) => p.name === "reviewed")?.value ?? 0;
  const correct = payload.find((p) => p.name === "correct")?.value ?? 0;
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : null;
  return (
    <div className="rounded-lg bg-surface-lowest border border-outline-variant px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label ? formatDate(label) : ""}</p>
      <p className="text-on-surface-variant">{reviewed} reviewed</p>
      {accuracy !== null && (
        <p className="text-success font-medium">{accuracy}% accuracy</p>
      )}
    </div>
  );
}

export function DailyActivityChart({ data }: Props) {
  // Show only dates with activity or the last 14 entries to keep the chart readable
  const sparse = data.filter((d) => d.reviewed > 0);
  const hasActivity = sparse.length > 0;

  // Show every 7th label to avoid crowding
  const ticks = data
    .filter((_, i) => i % 7 === 0 || i === data.length - 1)
    .map((d) => d.date);

  if (!hasActivity) {
    return (
      <p className="py-6 text-center text-sm text-on-surface-variant">
        No activity yet. Data appears after your first review session.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="20%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--outline-variant)" strokeOpacity={0.5} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary-container)", opacity: 0.4 }} />
        <Bar dataKey="reviewed" name="reviewed" fill="var(--secondary-container)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="correct" name="correct" fill="var(--primary)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
