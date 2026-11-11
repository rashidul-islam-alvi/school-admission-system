import { GraduationCap } from "lucide-react";

export default function ApplicationsEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <GraduationCap className="mx-auto text-slate-300" size={40} />

      <h3 className="mt-4 font-semibold text-slate-800">No applications yet</h3>

      <p className="mt-2 text-sm text-slate-500">
        Your admission reservations will appear here.
      </p>
    </div>
  );
}
