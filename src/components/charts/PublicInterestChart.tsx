import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PublicInterestPoint } from "@/types/research";

interface PublicInterestChartProps {
  data: PublicInterestPoint[];
  height?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-[var(--shadow-card-hover)]">
      <p className="text-xs font-medium text-ink-secondary">{label}</p>
      <p className="text-sm font-semibold text-ink-primary tabular-nums">{payload[0].value} / 100 interés</p>
    </div>
  );
}

export function PublicInterestChart({ data, height = 220 }: PublicInterestChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={{ stroke: "#c3c2b7" }}
          tick={{ fill: "#898781", fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#898781", fontSize: 12 }}
          width={32}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c3c2b7", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="interest"
          stroke="#c2410c"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#c2410c", stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
