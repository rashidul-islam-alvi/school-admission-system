import { GraduationCap } from "lucide-react";

export default function ClassesEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <GraduationCap className="mx-auto text-slate-300" size={38} />

      <h3 className="mt-4 font-semibold text-slate-800">
        No classes available yet
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        New classes will appear here when they are created.
      </p>
    </div>
  );
}
