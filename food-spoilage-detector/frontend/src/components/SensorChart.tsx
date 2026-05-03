import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export interface ChartPoint {
  t_hours: number;
  temp_c?: number;
  humidity_pct?: number;
  co2_ppm?: number;
  ethylene_ppm?: number;
  methane_ppm?: number;
  rsl_days?: number;
}

export function SensorChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#222831" strokeDasharray="3 3" />
          <XAxis
            dataKey="t_hours"
            stroke="#8b949e"
            tick={{ fontSize: 11 }}
            label={{ value: "hours since harvest", position: "insideBottom", offset: -2, fill: "#8b949e", fontSize: 11 }}
          />
          <YAxis yAxisId="left" stroke="#8b949e" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#8b949e" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#171b22", border: "1px solid #222831", color: "#e6edf3" }}
            labelFormatter={(v) => `t=${Number(v).toFixed(1)}h`}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#8b949e" }} />
          <Line yAxisId="left"  type="monotone" dataKey="co2_ppm"      stroke="#58a6ff" dot={false} name="CO2 (ppm)" />
          <Line yAxisId="left"  type="monotone" dataKey="ethylene_ppm" stroke="#d29922" dot={false} name="Ethylene (ppm)" />
          <Line yAxisId="right" type="monotone" dataKey="temp_c"       stroke="#f85149" dot={false} name="Temp (°C)" />
          <Line yAxisId="right" type="monotone" dataKey="rsl_days"     stroke="#3fb950" dot={false} name="RSL (days)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
