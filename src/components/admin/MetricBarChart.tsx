import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AccentRole } from "@/lib/statusColors";

const ROLE_VAR: Record<AccentRole, string> = {
  neutral: "--accent-neutral",
  progress: "--accent-progress",
  caution: "--accent-caution",
  success: "--accent-success",
  critical: "--destructive",
};

export interface MetricBarDatum {
  label: string;
  value: number;
  role: AccentRole;
}

// A small categorical bar chart — each bar is its own labeled category
// (not a multi-period series), so the x-axis labels carry identity and no
// legend is needed, per the dataviz skill's rule that a legend is only
// mandatory for 2+ *series*. Bar thickness capped, 4px rounded caps, hairline
// gridlines only on the y-axis — matches the skill's fixed mark specs.
const MetricBarChart = ({ data, height = 220 }: { data: MetricBarDatum[]; height?: number }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={`hsl(var(${ROLE_VAR[entry.role]}))`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricBarChart;
