import { Status } from "../api/client";

const COLOR: Record<Status, { fill: string; ring: string; label: string }> = {
  green: { fill: "bg-bss-green", ring: "ring-bss-green/40", label: "Stable" },
  yellow: { fill: "bg-bss-yellow", ring: "ring-bss-yellow/40", label: "Drifting" },
  red: { fill: "bg-bss-red", ring: "ring-bss-red/40", label: "Spoilage Imminent" },
};

export function TrafficLight({ status }: { status: Status | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col gap-2 rounded-2xl bg-bss-card p-4 ring-1 ring-bss-line">
        {(["red", "yellow", "green"] as Status[]).map((s) => {
          const active = status === s;
          return (
            <div
              key={s}
              className={[
                "h-12 w-12 rounded-full transition-all",
                active ? `${COLOR[s].fill} animate-soft-pulse ring-8 ${COLOR[s].ring}` : "bg-bss-line/60",
              ].join(" ")}
            />
          );
        })}
      </div>
      {status && (
        <div className="text-sm font-medium text-bss-muted">{COLOR[status].label}</div>
      )}
    </div>
  );
}
