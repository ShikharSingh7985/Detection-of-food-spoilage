import { useEffect, useState } from "react";
import { Banana, Activity, Sliders, FastForward, Upload } from "lucide-react";
import { ManualInputPanel } from "../components/ManualInputPanel";
import { SimulationPanel } from "../components/SimulationPanel";
import { TimeSlider } from "../components/TimeSlider";
import { CsvUploadPanel } from "../components/CsvUploadPanel";
import { getHealth } from "../api/client";

type Tab = "manual" | "live" | "fast" | "upload";

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("manual");
  const [modelKind, setModelKind] = useState<string>("...");
  const [modelVersion, setModelVersion] = useState<string>("");

  useEffect(() => {
    getHealth()
      .then((h) => {
        setModelKind(h.model_kind);
        setModelVersion(h.model_version);
      })
      .catch(() => setModelKind("offline"));
  }, []);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "manual", label: "Manual input", icon: Sliders },
    { id: "live", label: "Live simulation", icon: Activity },
    { id: "fast", label: "Fast-forward", icon: FastForward },
    { id: "upload", label: "Upload CSV", icon: Upload },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Banana className="h-7 w-7 text-bss-yellow" />
          <div>
            <h1 className="text-xl font-semibold">Banana Storage Saver</h1>
            <p className="text-xs text-bss-muted">
              Predicting Remaining Shelf Life from temperature, humidity, and gas readings
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-bss-card px-3 py-1.5 text-xs font-mono text-bss-muted ring-1 ring-bss-line">
          model: <span className="text-bss-text">{modelKind}</span>
          {modelVersion && <span className="ml-2">v{modelVersion}</span>}
        </div>
      </header>

      <nav className="mb-5 flex gap-1 rounded-xl bg-bss-card p-1 ring-1 ring-bss-line">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition",
              tab === id ? "bg-bss-bg text-bss-text" : "text-bss-muted hover:text-bss-text",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {tab === "manual" && <ManualInputPanel />}
      {tab === "live" && <SimulationPanel />}
      {tab === "fast" && <TimeSlider />}
      {tab === "upload" && <CsvUploadPanel />}

      <footer className="mt-8 text-center text-xs text-bss-muted">
        Trained on physics-simulated data calibrated to published Cavendish banana respiration parameters
        (Arrhenius + Michaelis-Menten). Real-sensor validation is future work. See <code>docs/SCIENCE.md</code>.
      </footer>
    </div>
  );
}
