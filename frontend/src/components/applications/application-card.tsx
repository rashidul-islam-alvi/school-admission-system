import {
  CalendarClock,
  GraduationCap,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import type { StudentApplication } from "../../types";
import ApplicationCountdown from "./application-countdown";
import ApplicationStatus from "./application-status";
import { useNavigate } from "@tanstack/react-router";

interface ApplicationCardProps {
  application: StudentApplication;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  confirming: boolean;
  cancelling: boolean;
}

export default function ApplicationCard({
  application,

  onCancel,
  confirming,
  cancelling,
}: ApplicationCardProps) {
  const isHeld = application.status === "HELD";
  const navigate = useNavigate();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap size={23} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {application.className}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Application #{application.holdId}
            </p>
          </div>
        </div>

        <ApplicationStatus status={application.status} />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Reservation ID</p>
          <p className="mt-1 font-semibold text-slate-800">
            #{application.holdId}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Class ID</p>
          <p className="mt-1 font-semibold text-slate-800">
            {application.classId}
          </p>
        </div>

        {isHeld ? (
          <div className="sm:col-span-2">
            <ApplicationCountdown expiresAt={application.expiresAt} />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarClock size={14} />
              Reservation expiry
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {new Date(application.expiresAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {isHeld && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/apply/$classId",
                params: { classId: application.classId },
              })
            }
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Proceed to Payment
          </button>

          <button
            onClick={() => onCancel(application.holdId)}
            disabled={confirming || cancelling}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}
