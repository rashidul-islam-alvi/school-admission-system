import { BookOpen } from "lucide-react";
import type { ClassItem } from "../../types";

interface ApplyClassCardProps {
  classItem: ClassItem;
}

export default function ApplyClassCard({ classItem }: ApplyClassCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <BookOpen size={22} />
        </div>

        <div>
          <p className="text-sm text-slate-500">Selected class</p>
          <h2 className="text-lg font-bold text-slate-900">{classItem.name}</h2>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total seats" value={classItem.totalSeats} />
        <Stat label="Available" value={classItem.availableSeats} />
        <Stat label="On hold" value={classItem.heldSeats} />
        <Stat label="Confirmed" value={classItem.confirmedSeats} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
