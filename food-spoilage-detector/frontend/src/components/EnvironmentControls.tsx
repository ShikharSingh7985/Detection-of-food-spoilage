import { Info } from "lucide-react";

export interface SliderRow {
  label: string;
  hint?: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export function Slider({ row }: { row: SliderRow }) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-bss-text">
          {row.label}
          {row.hint && (
            <span title={row.hint} className="cursor-help text-bss-muted">
              <Info className="h-3.5 w-3.5" />
            </span>
          )}
        </span>
        <span className="font-mono text-bss-muted">
          {row.value.toFixed(row.step >= 1 ? 0 : 1)} {row.unit}
        </span>
      </div>
      <input
        type="range"
        min={row.min}
        max={row.max}
        step={row.step}
        value={row.value}
        onChange={(e) => row.setValue(Number(e.target.value))}
        className="accent-bss-accent"
      />
    </label>
  );
}

export function EnvironmentControls({ rows }: { rows: SliderRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <Slider key={r.label} row={r} />
      ))}
    </div>
  );
}
