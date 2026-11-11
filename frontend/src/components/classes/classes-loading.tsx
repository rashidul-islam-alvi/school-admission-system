import { LoaderCircle } from "lucide-react";

export default function ClassesLoading() {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto animate-spin text-indigo-600"
          size={28}
        />
        <p className="mt-3 text-sm text-slate-500">Loading classes...</p>
      </div>
    </div>
  );
}
