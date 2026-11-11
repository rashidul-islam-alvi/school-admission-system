import type { StudentApplication } from "../../types";

interface ApplicationStatusProps {
  status: StudentApplication["status"];
}

const statusStyles = {
  HELD: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-red-50 text-red-700",
};

export default function ApplicationStatus({ status }: ApplicationStatusProps) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
