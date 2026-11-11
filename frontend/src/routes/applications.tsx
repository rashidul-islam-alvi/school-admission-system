import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { useApplications } from "../hooks/use-applications";
import ApplicationCard from "../components/applications/application-card";
import ApplicationStats from "../components/applications/application-stats";
import ApplicationsEmpty from "../components/applications/applications-empty";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const {
    studentId,
    applications,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    actionMessage,
    actionError,
    confirm,
    cancel,
    confirmingId,
    cancellingId,
  } = useApplications();

  if (!studentId || !/^\d{17}$/.test(studentId)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertCircle className="mx-auto text-amber-600" size={32} />

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Student identification required
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Please save your 17-digit birth registration number above to view your
          applications.
        </p>
      </div>
    );
  }

  const heldCount = applications.filter((app) => app.status === "HELD").length;

  const confirmedCount = applications.filter(
    (app) => app.status === "CONFIRMED",
  ).length;

  return (
    <main>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Your admission journey
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track and manage your admission reservations.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {actionMessage && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <LoaderCircle className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">
            Unable to load applications
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again."}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <ApplicationStats
            total={applications.length}
            pending={heldCount}
            confirmed={confirmedCount}
          />

          {applications.length === 0 ? (
            <ApplicationsEmpty />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.holdId}
                  application={application}
                  onConfirm={confirm}
                  onCancel={cancel}
                  confirming={confirmingId === application.holdId}
                  cancelling={cancellingId === application.holdId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
