import { useNavigate } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock3 } from "lucide-react";

import { useCreateHold } from "../../hooks/use-create-hold";
import type { ClassItem, StudentApplication } from "../../types";
import { useCurrentTime } from "../../hooks/use-current-time";

interface ClassCardProps {
  item: ClassItem;
  application?: StudentApplication;
}

export default function ClassCard({ item, application }: ClassCardProps) {
  const navigate = useNavigate();
  const now = useCurrentTime();
  const { createHold, errorMessage, isPending } = useCreateHold();

  const isAvailable = item.availableSeats > 0;

  const isConfirmed = application?.status === "CONFIRMED";

  const expiryTime = application
    ? new Date(application.expiresAt).getTime()
    : 0;

  const isHeld =
    application?.status === "HELD" &&
    (now === null || (Number.isFinite(expiryTime) && expiryTime > now));

  const hasApplication = isConfirmed || isHeld;

  const reservedSeats = item.heldSeats + item.confirmedSeats;

  const occupancy =
    item.totalSeats > 0
      ? Math.min(100, Math.round((reservedSeats / item.totalSeats) * 100))
      : 0;

  async function handleApply() {
    if (hasApplication || !isAvailable || isPending) return;

    const hold = await createHold(item.id);

    if (!hold) return;

    navigate({
      to: "/apply/$classId",
      params: {
        classId: item.id,
      },
    });
  }

  function handleContinuePayment() {
    if (!application || !isHeld) return;

    navigate({
      to: "/apply/$classId",
      params: {
        classId: item.id,
      },
    });
  }

  const applicationStatus = isConfirmed
    ? "Confirmed"
    : isHeld
      ? "Payment Pending"
      : "Not Applied";

  const applicationStatusClass = isConfirmed
    ? "bg-emerald-50 text-emerald-700"
    : isHeld
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

  const buttonLabel = isPending
    ? "Reserving..."
    : isConfirmed
      ? "Confirmed"
      : isHeld
        ? "Payment"
        : !isAvailable
          ? "Fully Booked"
          : "Apply Now";

  function renderAction() {
    if (isHeld) {
      return (
        <button
          type="button"
          onClick={handleContinuePayment}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600"
        >
          Payment
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleApply}
        disabled={!isAvailable || isPending || isConfirmed}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <article className="border-b border-slate-200 px-5 py-5 transition last:border-b-0 hover:bg-slate-50/70 sm:px-6">
      {/* Desktop row */}
      <div className="hidden grid-cols-[minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(120px,0.8fr)_110px_130px] items-center gap-4 lg:grid">
        {/* Class name */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">Admission class</p>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Total seats */}
        <div>
          <p className="text-sm font-medium text-slate-800">
            {item.totalSeats}
          </p>
          <p className="mt-1 text-xs text-slate-400">Seats</p>
        </div>

        {/* Held seats */}
        <div>
          <p className="text-sm font-medium text-amber-600">{item.heldSeats}</p>
          <p className="mt-1 text-xs text-slate-400">On hold</p>
        </div>

        {/* Confirmed seats */}
        <div>
          <p className="text-sm font-medium text-emerald-600">
            {item.confirmedSeats}
          </p>
          <p className="mt-1 text-xs text-slate-400">Confirmed</p>
        </div>

        {/* Available seats */}
        <div>
          <p
            className={`text-sm font-semibold ${
              isAvailable ? "text-slate-900" : "text-red-600"
            }`}
          >
            {item.availableSeats}
          </p>

          <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        {/* Class availability */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAvailable ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {isAvailable ? "Open" : "Full"}
          </span>
        </div>

        {/* Application action */}
        <div className="flex justify-end">{renderAction()}</div>
      </div>

      {/* Mobile and tablet layout */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-sm font-semibold text-slate-900">
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">Admission class</p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isAvailable ? "Open" : "Full"}
          </span>
        </div>

        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${applicationStatusClass}`}
          >
            {isConfirmed ? (
              <CheckCircle2 size={13} />
            ) : isHeld ? (
              <Clock3 size={13} />
            ) : null}

            {applicationStatus}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MobileStat label="Total seats" value={item.totalSeats} />
          <MobileStat label="On hold" value={item.heldSeats} />
          <MobileStat label="Confirmed" value={item.confirmedSeats} />
          <MobileStat label="Available" value={item.availableSeats} highlight />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Seat occupancy</span>
            <span>{occupancy}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-red-600">{errorMessage}</p>
        )}

        <div className="mt-4 [&>button]:w-full">{renderAction()}</div>
      </div>
    </article>
  );
}

function MobileStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p
        className={`mt-1 text-lg font-semibold ${
          highlight ? "text-indigo-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
