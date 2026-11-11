import { useEffect, useRef } from "react";
import { Clock3 } from "lucide-react";
import { useCurrentTime } from "../../hooks/use-current-time";

interface ReservationCountdownProps {
  expiresAt: string;
  onExpire: () => void;
}

export default function ReservationCountdown({
  expiresAt,
  onExpire,
}: ReservationCountdownProps) {
  const now = useCurrentTime();
  const hasNotified = useRef(false);

  const expiry = new Date(expiresAt).getTime();

  const remainingSeconds =
    now !== null && Number.isFinite(expiry)
      ? Math.max(0, Math.ceil((expiry - now) / 1000))
      : 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const isExpired =
    now !== null && (!Number.isFinite(expiry) || remainingSeconds <= 0);

  useEffect(() => {
    if (isExpired && !hasNotified.current) {
      hasNotified.current = true;
      onExpire();
    }
  }, [isExpired, onExpire]);

  return (
    <section
      className={`rounded-2xl border p-6 ${
        isExpired
          ? "border-red-200 bg-red-50"
          : "border-indigo-100 bg-indigo-50/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <Clock3
          size={22}
          className={isExpired ? "text-red-600" : "text-indigo-600"}
        />

        <div>
          <h2 className="font-bold text-slate-900">
            Temporary seat reservation
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Expires at{" "}
            {Number.isFinite(expiry)
              ? new Date(expiry).toLocaleTimeString()
              : "Unknown"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {isExpired ? (
          <p className="text-lg font-bold text-red-600">Reservation expired</p>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Time remaining
            </p>

            <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-indigo-700">
              {now === null
                ? "--:--"
                : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
