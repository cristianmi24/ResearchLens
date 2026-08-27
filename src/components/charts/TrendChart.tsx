import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendPoint {
  year: number;
  publications: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  /** Serie secundaria para comparar (ej. el conjunto de temas) contra `data` (ej. un tema puntual). */
  compareData?: TrendPoint[];
  primaryLabel?: string;
  compareLabel?: string;
}

interface MergedPoint {
  year: number;
  primary: number | null;
  compare: number | null;
}

function mergeSeries(primary: TrendPoint[], compare?: TrendPoint[]): MergedPoint[] {
  const primaryByYear = new Map(primary.map((p) => [p.year, p.publications]));
  const compareByYear = new Map((compare ?? []).map((p) => [p.year, p.publications]));
  const years = Array.from(new Set([...primaryByYear.keys(), ...compareByYear.keys()])).sort((a, b) => a - b);

  return years.map((year) => ({
    year,
    primary: primaryByYear.get(year) ?? null,
    compare: compareByYear.get(year) ?? null,
  }));
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number | null; name: string; color: string }[];
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-[var(--shadow-card-hover)] space-y-1">
      <p className="text-xs font-medium text-ink-secondary">{label}</p>
      {payload.map((entry) =>
        entry.value === null ? null : (
          <p key={entry.name} className="text-sm font-semibold tabular-nums" style={{ color: entry.color }}>
            {entry.value} · {entry.name}
          </p>
        ),
      )}
    </div>
  );
}

export function TrendChart({
  data,
  height = 260,
  compareData,
  primaryLabel = "Publicaciones",
  compareLabel = "Conjunto de temas",
}: TrendChartProps) {
  const merged = mergeSeries(data, compareData);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={merged} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#2a78d6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={{ stroke: "#c3c2b7" }}
          tick={{ fill: "#898781", fontSize: 12 }}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#898781", fontSize: 12 }} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c3c2b7", strokeWidth: 1 }} />
        {compareData && (
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconType="plainline"
            formatter={(value) => <span className="text-xs text-ink-secondary">{value}</span>}
          />
        )}
        {compareData && (
          <Line
            type="monotone"
            dataKey="compare"
            name={compareLabel}
            stroke="#c3c2b7"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4, fill: "#c3c2b7", stroke: "#fff", strokeWidth: 2 }}
            connectNulls
          />
        )}
        <Area
          type="monotone"
          dataKey="primary"
          name={primaryLabel}
          stroke="#2a78d6"
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={{ r: 3, fill: "#2a78d6", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#2a78d6", stroke: "#fff", strokeWidth: 2 }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
