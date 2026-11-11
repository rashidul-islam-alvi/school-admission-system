import { ShieldCheck } from "lucide-react";

interface ApplyStudentCardProps {
  studentId: string;
}

export default function ApplyStudentCard({ studentId }: ApplyStudentCardProps) {
  const isValid = /^\d{17}$/.test(studentId);

  const maskedId = isValid
    ? `${studentId.slice(0, 4)} •••••••••• ${studentId.slice(-3)}`
    : "No valid student ID found";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-indigo-600" />

        <h2 className="font-bold text-slate-900">Student identification</h2>
      </div>

      <div className="mt-5">
        <p className="text-xs text-slate-500">Birth registration number</p>

        <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 font-medium tracking-wider text-slate-800">
          {maskedId}
        </p>

        <p
          className={`mt-3 text-xs ${
            isValid ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isValid
            ? "Your student identification is verified for this session."
            : "Please return to the homepage and enter a valid 17-digit ID."}
        </p>
      </div>
    </section>
  );
}
