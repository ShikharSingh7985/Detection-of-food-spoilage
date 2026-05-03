import { Status } from "../api/client";
import { Hourglass } from "lucide-react";

const COLOR: Record<Status, string> = {
  green: "text-bss-green",
  yellow: "text-bss-yellow",
  red: "text-bss-red",
};

export function RSLCountdown({
  rslDays,
  status,
}: {
  rslDays: number | null;
  status: Status | null;
}) {
  if (rslDays === null || status === null) {
    return (
      <div className="flex flex-col items-center gap-2 text-bss-muted">
        <Hourglass className="h-10 w-10 animate-pulse" />
        <div className="text-lg">calibrating...</div>
      </div>
    );
  }
  const days = Math.max(0, rslDays);
  const wholeDays = Math.floor(days);
  const hours = Math.round((days - wholeDays) * 24);
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`text-7xl font-bold tabular-nums ${COLOR[status]}`}>
        {days.toFixed(1)}
      </div>
      <div className="mt-1 text-base font-medium text-bss-text">days remaining</div>
      <div className="mt-1 text-sm text-bss-muted">
        ~ {wholeDays}d {hours}h until predicted spoilage
      </div>
    </div>
  );
}
