import { useState } from "react";
import {
  UserRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID;

export default function StudentIdentification() {
  const [studentId, setStudentId] = useState(
    () => localStorage.getItem("studentId") ?? "",
  );

  const [savedId, setSavedId] = useState(
    () => localStorage.getItem("studentId") ?? "",
  );

  const [error, setError] = useState("");

  const isAdmin = savedId === ADMIN_ID && Boolean(ADMIN_ID);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const id = studentId.trim();

    if (!/^\d{17}$/.test(id)) {
      setError("Please enter a valid 17-digit birth registration number.");
      return;
    }

    localStorage.setItem("studentId", id);
    setStudentId(id);
    setSavedId(id);
    setError("");

    window.dispatchEvent(new Event("identityChanged"));
  }

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UserRound size={23} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isAdmin
                  ? "Administrator identification"
                  : "Student identification"}
              </h2>

              {savedId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 size={12} />
                  {isAdmin ? "ADMIN" : "ID SAVED"}
                </span>
              )}
            </div>

            <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
              {isAdmin
                ? "Administrator access is active on this browser."
                : "Enter the student's birth registration number to manage admission applications."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-600" />
          17-digit registration number
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={17}
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Enter 17-digit registration number"
              aria-label="Student birth registration number"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium tracking-wide text-slate-800 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            Save ID
            <ArrowRight size={16} />
          </button>
        </form>

        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertCircle size={15} />
            {error}
          </p>
        )}

        {savedId && !error && (
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={14} />
            {isAdmin
              ? "Administrator ID recognized."
              : "Student identification saved successfully."}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Your ID is stored in this browser and automatically included in
          admission requests.
        </p>
      </div>
    </section>
  );
}
