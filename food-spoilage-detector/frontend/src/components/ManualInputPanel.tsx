import { useState } from "react";
import { TrafficLight } from "./TrafficLight";
import { RSLCountdown } from "./RSLCountdown";
import { EnvironmentControls } from "./EnvironmentControls";
import { usePrediction } from "../hooks/usePrediction";

export function ManualInputPanel() {
  const [tempC, setTempC] = useState(22);
  const [rh, setRh] = useState(70);
  const [co2, setCo2] = useState(1500);
  const [eth, setEth] = useState(1.5);
  const [ch4, setCh4] = useState(0);
  const [hours, setHours] = useState(96);
  const [ripe, setRipe] = useState(3);

  const { result, loading, error, predict } = usePrediction();

  const onPredict = () =>
    predict({
      temp_c: tempC,
      humidity_pct: rh,
      co2_ppm: co2,
      ethylene_ppm: eth,
      methane_ppm: ch4,
      hours_since_harvest: hours,
      ripeness_estimate: ripe,
    });

  const rows = [
    { label: "Temperature", hint: "Optimal 13-14°C; chilling injury below 13°C", value: tempC, setValue: setTempC, min: -5, max: 40, step: 0.5, unit: "°C" },
    { label: "Humidity", hint: "Optimal 90-95% RH", value: rh, setValue: setRh, min: 30, max: 100, step: 1, unit: "%" },
    { label: "CO₂", hint: "Rises during respiration; toxic above 70,000 ppm", value: co2, setValue: setCo2, min: 300, max: 10000, step: 50, unit: "ppm" },
    { label: "Ethylene", hint: "Climacteric peak ~7.4 µL/kg/h ripe banana", value: eth, setValue: setEth, min: 0, max: 50, step: 0.1, unit: "ppm" },
    { label: "Methane", hint: "Anaerobic decomposition byproduct — late spoilage signal", value: ch4, setValue: setCh4, min: 0, max: 100, step: 0.1, unit: "ppm" },
    { label: "Hours since harvest", value: hours, setValue: setHours, min: 0, max: 720, step: 1, unit: "h" },
    { label: "Ripeness stage", hint: "1 (all green) … 7 (yellow flecked brown, overripe)", value: ripe, setValue: setRipe, min: 1, max: 7, step: 1, unit: "" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <h3 className="mb-4 text-lg font-semibold">Manual sensor input</h3>
        <EnvironmentControls rows={rows} />
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onPredict}
            disabled={loading}
            className="rounded-lg bg-bss-accent px-4 py-2 font-medium text-bss-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Predict shelf life"}
          </button>
          {error && <span className="text-sm text-bss-red">{error}</span>}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
        <TrafficLight status={result?.status ?? null} />
        <RSLCountdown rslDays={result?.rsl_days ?? null} status={result?.status ?? null} />
        {result?.reason && (
          <div className="rounded-lg bg-bss-bg/60 px-3 py-2 text-center text-sm text-bss-muted">
            {result.reason}
          </div>
        )}
        {result && result.contributing_factors.length > 0 && (
          <ul className="w-full space-y-1 text-xs">
            {result.contributing_factors.map((f) => (
              <li key={f.name} className="flex justify-between gap-2 rounded bg-bss-bg/40 px-2 py-1">
                <span className="font-mono text-bss-muted">{f.name}</span>
                <span
                  className={
                    f.severity === "critical"
                      ? "text-bss-red"
                      : f.severity === "warning"
                      ? "text-bss-yellow"
                      : "text-bss-accent"
                  }
                >
                  {f.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
