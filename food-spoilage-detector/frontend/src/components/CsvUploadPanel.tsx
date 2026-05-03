import { useMemo, useRef, useState } from "react";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  postPredictCsv,
  CsvPredictionResponse,
  CsvPredictionRow,
  Status,
} from "../api/client";
import { TrafficLight } from "./TrafficLight";
import { RSLCountdown } from "./RSLCountdown";
import { SensorChart, ChartPoint } from "./SensorChart";

const STATUS_COLOR: Record<Status, string> = {
  green: "text-bss-green",
  yellow: "text-bss-yellow",
  red: "text-bss-red",
};

const STATUS_BG: Record<Status, string> = {
  green: "bg-bss-green/15",
  yellow: "bg-bss-yellow/15",
  red: "bg-bss-red/15",
};

export function CsvUploadPanel() {
  const [result, setResult] = useState<CsvPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CsvPredictionRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedRow(null);
    try {
      const r = await postPredictCsv(file);
      setResult(r);
      setSelectedRow(r.rows[0] ?? null);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }

  function downloadAnnotated() {
    if (!result) return;
    const blob = new Blob([result.annotated_csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `annotated_${result.filename}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartData: ChartPoint[] = useMemo(() => {
    if (!result) return [];
    return result.rows.map((r) => ({
      t_hours: r.hours_since_harvest,
      temp_c: r.temp_c,
      humidity_pct: r.humidity_pct,
      co2_ppm: r.co2_ppm,
      ethylene_ppm: r.ethylene_ppm,
      methane_ppm: r.methane_ppm,
      rsl_days: r.predicted_rsl_days,
    }));
  }, [result]);

  const totalCount = result ? result.status_counts.green + result.status_counts.yellow + result.status_counts.red : 0;
  const pct = (n: number) => (totalCount ? ((n / totalCount) * 100).toFixed(1) : "0.0");

  return (
    <div className="grid grid-cols-1 gap-6">
      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={[
            "rounded-2xl border-2 border-dashed p-10 text-center transition",
            drag ? "border-bss-accent bg-bss-accent/5" : "border-bss-line bg-bss-card",
          ].join(" ")}
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-bss-muted" />
          <h3 className="mb-1 text-lg font-semibold">Upload sensor CSV</h3>
          <p className="mx-auto mb-5 max-w-xl text-sm text-bss-muted">
            Drag a CSV file here or click below. The model predicts Remaining Shelf Life and traffic-light
            status for each row, then lets you download an annotated copy.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-bss-accent px-4 py-2 font-medium text-bss-bg hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Uploading…" : "Choose CSV file"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <details className="mx-auto mt-6 max-w-2xl text-left text-xs text-bss-muted">
            <summary className="cursor-pointer text-bss-text">Required columns</summary>
            <div className="mt-2 space-y-2">
              <p>Required (any of these names):</p>
              <ul className="list-disc pl-5">
                <li><code>temp_c</code> or <code>DHT22_temperature_C</code> — °C</li>
                <li><code>humidity_pct</code> or <code>DHT22_humidity_percent</code> — %</li>
                <li><code>co2_ppm</code> or <code>MQ135_co2_ppm</code> — ppm</li>
                <li><code>ethylene_ppm</code> or <code>MQ135_ethylene_ppm</code> — ppm</li>
                <li><code>methane_ppm</code> or <code>MQ4_methane_ppm</code> — ppm</li>
                <li><code>hours_since_harvest</code> or <code>elapsed_hours</code> — h</li>
                <li><code>ripeness_estimate</code> or <code>ripeness_stage_1to7</code> — 1..7</li>
              </ul>
              <p>
                Tip: the file at <code>data/processed/banana_synthetic_30days_sensors.csv</code>
                already has the right shape — try uploading it.
              </p>
            </div>
          </details>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-bss-red/10 p-4 text-sm text-bss-red ring-1 ring-bss-red/30">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <div className="font-semibold">Upload failed</div>
            <div className="mt-1 text-bss-red/80">{error}</div>
            <button
              onClick={() => { setError(null); setResult(null); }}
              className="mt-2 rounded bg-bss-card px-2 py-1 text-xs text-bss-text"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-bss-card p-4 ring-1 ring-bss-line">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-bss-accent" />
              <div>
                <div className="font-semibold">{result.filename}</div>
                <div className="text-xs text-bss-muted">
                  {result.n_rows.toLocaleString()} rows · model: {result.model_kind} v{result.model_version}
                  {result.n_preview_rows < result.n_rows && (
                    <span className="ml-2 text-bss-yellow">
                      (showing first {result.n_preview_rows} in preview)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadAnnotated}
                className="flex items-center gap-1 rounded-lg bg-bss-accent px-3 py-2 text-sm font-medium text-bss-bg hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Download annotated CSV
              </button>
              <button
                onClick={() => { setResult(null); setSelectedRow(null); }}
                className="rounded-lg bg-bss-line px-3 py-2 text-sm font-medium text-bss-text"
              >
                Upload another
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["green", "yellow", "red"] as Status[]).map((s) => (
              <div key={s} className={`rounded-2xl p-4 ring-1 ring-bss-line ${STATUS_BG[s]}`}>
                <div className="flex items-center justify-between text-sm text-bss-muted">
                  <span className="capitalize">{s}</span>
                  <CheckCircle2 className={`h-4 w-4 ${STATUS_COLOR[s]}`} />
                </div>
                <div className={`mt-1 text-3xl font-bold tabular-nums ${STATUS_COLOR[s]}`}>
                  {result.status_counts[s].toLocaleString()}
                </div>
                <div className="text-xs text-bss-muted">{pct(result.status_counts[s])}% of rows</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-bss-card p-4 ring-1 ring-bss-line sm:grid-cols-4">
            <Stat label="RSL min" value={`${result.rsl_stats.min.toFixed(2)} d`} />
            <Stat label="RSL median" value={`${result.rsl_stats.median.toFixed(2)} d`} />
            <Stat label="RSL mean" value={`${result.rsl_stats.mean.toFixed(2)} d`} />
            <Stat label="RSL max" value={`${result.rsl_stats.max.toFixed(2)} d`} />
          </div>

          <div className="rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
            <h4 className="mb-3 text-sm font-semibold text-bss-muted">RSL & sensor curves over uploaded rows</h4>
            <SensorChart data={chartData} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl bg-bss-card p-3 ring-1 ring-bss-line">
              <div className="mb-2 px-2 text-sm font-semibold text-bss-muted">
                Per-row predictions ({result.rows.length} shown)
              </div>
              <div className="max-h-[440px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-bss-card text-left text-bss-muted">
                    <tr>
                      <th className="px-2 py-1.5">#</th>
                      <th className="px-2 py-1.5">Temp</th>
                      <th className="px-2 py-1.5">RH</th>
                      <th className="px-2 py-1.5">CO₂</th>
                      <th className="px-2 py-1.5">C₂H₄</th>
                      <th className="px-2 py-1.5">CH₄</th>
                      <th className="px-2 py-1.5">RSL</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => {
                      const sel = selectedRow?.row_index === row.row_index;
                      return (
                        <tr
                          key={row.row_index}
                          onClick={() => setSelectedRow(row)}
                          className={[
                            "cursor-pointer border-t border-bss-line/40 hover:bg-bss-bg/40",
                            sel ? "bg-bss-bg/60" : "",
                          ].join(" ")}
                        >
                          <td className="px-2 py-1 font-mono text-bss-muted">{row.row_index}</td>
                          <td className="px-2 py-1 tabular-nums">{row.temp_c.toFixed(1)}°</td>
                          <td className="px-2 py-1 tabular-nums">{row.humidity_pct.toFixed(0)}%</td>
                          <td className="px-2 py-1 tabular-nums">{row.co2_ppm.toFixed(0)}</td>
                          <td className="px-2 py-1 tabular-nums">{row.ethylene_ppm.toFixed(2)}</td>
                          <td className="px-2 py-1 tabular-nums">{row.methane_ppm.toFixed(2)}</td>
                          <td className={`px-2 py-1 tabular-nums font-semibold ${STATUS_COLOR[row.predicted_status]}`}>
                            {row.predicted_rsl_days.toFixed(2)}d
                          </td>
                          <td className={`px-2 py-1 capitalize ${STATUS_COLOR[row.predicted_status]}`}>
                            {row.predicted_status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 rounded-2xl bg-bss-card p-5 ring-1 ring-bss-line">
              <div className="text-sm font-semibold text-bss-muted">
                Row {selectedRow?.row_index ?? 0}
              </div>
              <TrafficLight status={selectedRow?.predicted_status ?? null} />
              <RSLCountdown
                rslDays={selectedRow?.predicted_rsl_days ?? null}
                status={selectedRow?.predicted_status ?? null}
              />
              {selectedRow?.prediction_reason && (
                <div className="rounded-lg bg-bss-bg/60 px-3 py-2 text-center text-sm text-bss-muted">
                  {selectedRow.prediction_reason}
                </div>
              )}
              {selectedRow && (
                <div className="w-full text-xs text-bss-muted space-y-1">
                  <div className="flex justify-between"><span>Confidence</span><span className="font-mono text-bss-text">{(selectedRow.prediction_confidence * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Contributing factors</span><span className="font-mono text-bss-text">{selectedRow.contributing_factor_count}</span></div>
                  <div className="flex justify-between"><span>Hours since harvest</span><span className="font-mono text-bss-text">{selectedRow.hours_since_harvest.toFixed(1)} h</span></div>
                  <div className="flex justify-between"><span>Ripeness</span><span className="font-mono text-bss-text">{selectedRow.ripeness_estimate}/7</span></div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-bss-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
