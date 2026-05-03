import { useEffect, useMemo, useState } from "react";
import { getSimulate, SimulateTimelinePoint } from "../api/client";
import { TrafficLight } from "./TrafficLight";
import { RSLCountdown } from "./RSLCountdown";
import { SensorChart, ChartPoint } from "./SensorChart";
import { EnvironmentControls } from "./EnvironmentControls";

export function TimeSlider() {
  const [tempC, setTempC] = useState(22);
  const [rh, setRh] = useState(70);
  const [ripe, setRipe] = useState(2.0);
  const [hours, setHours] = useState(24 * 14);
  const [timeline, setTimeline] = useState<SimulateTimelinePoint[]>([]);
  const [pos, setPos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSim() {
    setLoading(true); setError(null);
    try {
      const r = await getSimulate({ temp_c: tempC, humidity_pct: rh, hours, initial_ripeness: ripe });
      setTimeline(r.timeline);
      setPos(0);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runSim(); /* eslint-disable-next-line */ }, []);

  const chartData: ChartPoint[] = useMemo(
    () =>
      timeline.slice(0, pos + 1).map((p) => ({
        t_hours: p.t_hours,
        temp_c: p.temp_c,
        humidity_pct: p.humidity_pct,
        co2_ppm: p.co2_ppm,
        ethylene_ppm: p.ethylene_ppm,
        rsl_days: p.rsl_days,
      })),
    [timeline, pos]
  );

  const current = timeline[pos] ?? null;

  const rows = [
    { label: "Temperature", value: tempC, setValue: setTempC, min: -5, max: 40, step: 0.5, unit: "°C" },
    { label: "Humidity", value: rh, setValue: setRh, min: 30, max: 100, step: 1, unit: "%" },
    { label: "Initial ripeness", value: ripe, setValue: setRipe, min: 1, max: 5, step: 0.1, unit: "" },
    { label: "Horizon", value: hours, setValue: setHours, min: 24, max: 24 * 30, step: 24, unit: "h" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <h3 className="mb-4 text-lg font-semibold">Fast-forward simulation</h3>
        <EnvironmentControls rows={rows} />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runSim}
            disabled={loading}
            className="rounded-lg bg-bss-accent px-3 py-2 font-medium text-bss-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Simulating..." : "Run simulation"}
          </button>
          {error && <span className="text-sm text-bss-red">{error}</span>}
        </div>

        <div className="mt-5">
          <SensorChart data={chartData} />
        </div>

        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={Math.max(0, timeline.length - 1)}
            step={1}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="w-full accent-bss-accent"
          />
          <div className="mt-1 flex justify-between text-xs text-bss-muted">
            <span>now</span>
            <span>
              t = {current ? current.t_hours.toFixed(1) : 0}h ({((current?.t_hours ?? 0) / 24).toFixed(1)}d)
            </span>
            <span>+{(hours / 24).toFixed(0)}d</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <TrafficLight status={current?.status ?? null} />
        <RSLCountdown rslDays={current?.rsl_days ?? null} status={current?.status ?? null} />
        {current && (
          <div className="text-center text-xs text-bss-muted">
            Temp {current.temp_c.toFixed(1)}°C · RH {current.humidity_pct.toFixed(0)}% · CO₂ {current.co2_ppm.toFixed(0)} ppm
          </div>
        )}
      </div>
    </div>
  );
}
