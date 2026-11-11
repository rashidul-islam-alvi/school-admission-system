import { Clock3 } from "lucide-react";
import { useCurrentTime } from "../../hooks/use-current-time";

interface ApplicationCountdownProps {
  expiresAt: string;
}

export default function ApplicationCountdown({
  expiresAt,
}: ApplicationCountdownProps) {
  const now = useCurrentTime();

  const expiry = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiry)) {
    return <span className="text-sm text-slate-500">Invalid expiry time</span>;
  }

  if (now !== null && expiry <= now) {
    return (
      <span className="font-semibold text-red-600">
        Reservation time expired
      </span>
    );
  }

  const remaining = now === null ? 0 : expiry - now;

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <Clock3 size={14} />
        Time remaining to confirm
      </p>

      <p className="font-mono text-lg font-bold tabular-nums text-amber-600">
        {now === null
          ? "--:--:--"
          : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
      </p>
    </div>
  );
}
