import { useMemo, useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useStream } from "../hooks/useWebSocket";
import { TrafficLight } from "./TrafficLight";
import { RSLCountdown } from "./RSLCountdown";
import { SensorChart, ChartPoint } from "./SensorChart";
import { EnvironmentControls } from "./EnvironmentControls";

export function SimulationPanel() {
  const [tempC, setTempC] = useState(22);
  const [rh, setRh] = useState(70);
  const [ripe, setRipe] = useState(2.0);
  const [running, setRunning] = useState(false);

  const { frames, latest, connected, reset } = useStream({
    enabled: running,
    temp_c: tempC,
    humidity_pct: rh,
    initial_ripeness: ripe,
  });

  const chartData: ChartPoint[] = useMemo(
    () =>
      frames.map((f) => ({
        t_hours: f.reading.timestamp_h,
        temp_c: f.reading.temp_c,
        humidity_pct: f.reading.humidity_pct,
        co2_ppm: f.reading.co2_ppm,
        ethylene_ppm: f.reading.ethylene_ppm,
        methane_ppm: f.reading.methane_ppm,
        rsl_days: f.prediction.rsl_days,
      })),
    [frames]
  );

  const rows = [
    { label: "Temperature", value: tempC, setValue: setTempC, min: -5, max: 40, step: 0.5, unit: "°C" },
    { label: "Humidity", value: rh, setValue: setRh, min: 30, max: 100, step: 1, unit: "%" },
    { label: "Initial ripeness", value: ripe, setValue: setRipe, min: 1, max: 5, step: 0.1, unit: "" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live simulation (1 sec = 30 sim minutes)</h3>
          <span className={`text-xs font-mono ${connected ? "text-bss-green" : "text-bss-muted"}`}>
            {connected ? "● connected" : "○ idle"}
          </span>
        </div>

        <EnvironmentControls rows={rows} />

        <div className="mt-4 flex gap-2">
          {!running ? (
            <button
              onClick={() => { reset(); setRunning(true); }}
              className="flex items-center gap-1 rounded-lg bg-bss-green px-3 py-2 font-medium text-bss-bg"
            >
              <Play className="h-4 w-4" /> Start
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="flex items-center gap-1 rounded-lg bg-bss-red px-3 py-2 font-medium text-bss-bg"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg bg-bss-line px-3 py-2 font-medium text-bss-text"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <div className="mt-5">
          <SensorChart data={chartData} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <TrafficLight status={latest?.prediction.status ?? null} />
        <RSLCountdown
          rslDays={latest?.prediction.rsl_days ?? null}
          status={latest?.prediction.status ?? null}
        />
        {latest?.prediction.reason && (
          <div className="rounded-lg bg-bss-bg/60 px-3 py-2 text-center text-sm text-bss-muted">
            {latest.prediction.reason}
          </div>
        )}
      </div>
    </div>
  );
}
