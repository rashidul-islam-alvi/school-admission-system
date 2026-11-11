import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Users,
  FileText,
  UserRoundCheck,
} from "lucide-react";

import { useClasses } from "../hooks/use-classes";
import ClassList from "../components/classes/classes-list";
import ClassesLoading from "../components/classes/classes-loading";
import ClassesError from "../components/classes/classes-error";
import ClassesEmpty from "../components/classes/classes-empty";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { classes, isLoading, isError, error, refetch, isFetching } =
    useClasses();

  const totalSeats = classes.reduce(
    (total, item) => total + item.totalSeats,
    0,
  );

  const availableSeats = classes.reduce(
    (total, item) => total + item.availableSeats,
    0,
  );

  const heldSeats = classes.reduce((total, item) => total + item.heldSeats, 0);

  const confirmedSeats = classes.reduce(
    (total, item) => total + item.confirmedSeats,
    0,
  );

  const reservedSeats = heldSeats + confirmedSeats;

  return (
    <main className="space-y-8">
      {/* Page heading */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              School administration
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Enrollment
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage admission classes and monitor seat availability.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admissions open
          </div>
        </div>
      </section>

      {/* Enrollment navigation */}
      <section className="overflow-x-auto border-b border-slate-200">
        <nav className="flex min-w-max items-center gap-7">
          <PageTab icon={BarChart3} label="Overview" />
          <PageTab icon={Users} label="Students" />
          <PageTab icon={GraduationCap} label="Classes" active />
          <PageTab icon={BookOpen} label="Programs" />
          <PageTab icon={CalendarDays} label="Schedules" />
          <PageTab icon={UserRoundCheck} label="Applicants" />
        </nav>
      </section>

      {/* Admission statistics */}
      {!isLoading && !isError && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total classes"
            value={classes.length}
            icon={GraduationCap}
          />
          <SummaryCard label="Total seats" value={totalSeats} icon={Users} />
          <SummaryCard
            label="Reserved seats"
            value={reservedSeats}
            icon={FileText}
          />
          <SummaryCard
            label="Available seats"
            value={availableSeats}
            icon={UserRoundCheck}
          />
        </section>
      )}

      {/* Class directory */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Classes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse classes and manage admission availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <span className={isFetching ? "inline-block animate-spin" : ""}>
                ↻
              </span>
              <span className="ml-2">Refresh</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <ClassesLoading />
        ) : isError ? (
          <ClassesError
            message={
              error instanceof Error ? error.message : "Please try again."
            }
            onRetry={() => refetch()}
          />
        ) : classes.length === 0 ? (
          <ClassesEmpty />
        ) : (
          <ClassList classes={classes} />
        )}
      </section>
    </main>
  );
}

function PageTab({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof BarChart3;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium ${
        active
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-slate-500"
      }`}
    >
      <Icon size={17} />
      {label}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={18} className="text-slate-400" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
