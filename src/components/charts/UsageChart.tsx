import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyUsagePoint } from "@/types/research";

interface UsageChartProps {
  data: DailyUsagePoint[];
  height?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function formatDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-[var(--shadow-card-hover)]">
      <p className="text-xs font-medium text-ink-secondary">{formatDay(label)}</p>
      <p className="text-sm font-semibold text-ink-primary tabular-nums">
        {value} {value === 1 ? "análisis" : "análisis"}
      </p>
    </div>
  );
}

export function UsageChart({ data, height = 220 }: UsageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tickLine={false}
          axisLine={{ stroke: "#c3c2b7" }}
          tick={{ fill: "#898781", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#898781", fontSize: 12 }}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#2a78d6", fillOpacity: 0.06 }} />
        <Bar dataKey="count" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
