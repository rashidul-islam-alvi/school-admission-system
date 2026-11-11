import { useCallback, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { useApplyReservation } from "../hooks/use-apply-reservation";

import ApplyClassCard from "../components/apply/apply-class-card";
import ApplyStudentCard from "../components/apply/apply-student-card";
import ReservationCountdown from "../components/apply/reservation-countdown";
import DemoPayment from "../components/apply/demo-payment";
import ApplyState from "../components/apply/apply-state";
import { useCurrentTime } from "../hooks/use-current-time";

export const Route = createFileRoute("/apply/$classId")({
  component: ApplicationPage,
});

function ApplicationPage() {
  const { classId } = Route.useParams();
  const navigate = useNavigate();

  const [studentId] = useState(() => localStorage.getItem("studentId") ?? "");
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const [reservationExpired, setReservationExpired] = useState(false);

  const isValidClassId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      classId,
    );

  const {
    classQuery,
    applicationsQuery,
    application,
    confirmMutation,
    cancelMutation,
  } = useApplyReservation(classId);

  const now = useCurrentTime();
  const handleReservationExpired = useCallback(() => {
    setReservationExpired(true);
  }, []);

  // Invalid class ID
  if (!isValidClassId) {
    return (
      <ApplyState
        type="error"
        title="Invalid class"
        description="The class ID in this URL is not valid."
        linkTo="/"
        linkLabel="Return to classes"
      />
    );
  }

  // Loading
  if (classQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading your application...
          </p>
        </div>
      </div>
    );
  }

  // Class loading error
  if (classQuery.isError || !classQuery.data) {
    return (
      <ApplyState
        type="error"
        title="Unable to load class"
        description={
          classQuery.error instanceof Error
            ? classQuery.error.message
            : "The selected class could not be found."
        }
        linkTo="/"
        linkLabel="Return to classes"
      />
    );
  }

  // Application loading error
  if (applicationsQuery.isError) {
    return (
      <ApplyState
        type="error"
        title="Unable to load your reservation"
        description="We couldn't retrieve your application. Please try again."
        linkTo="/applications"
        linkLabel="My applications"
      />
    );
  }

  // No reservation
  if (!application) {
    return (
      <ApplyState
        type="warning"
        title="No active reservation found"
        description="You don't have an application for this class. Return to the homepage and apply again."
        linkTo="/"
        linkLabel="Browse classes"
      />
    );
  }

  // Already confirmed
  if (application.status === "CONFIRMED") {
    return (
      <ApplyState
        type="success"
        title="Admission already confirmed"
        description="Your payment has already been completed and your admission is confirmed."
        linkTo="/applications"
        linkLabel="My applications"
      />
    );
  }

  // Expired according to backend
  if (application.status === "EXPIRED") {
    return (
      <ApplyState
        type="error"
        title="Reservation expired"
        description="Your temporary seat reservation has expired. You can return to the homepage to check seat availability and apply again."
        linkTo="/"
        linkLabel="Browse classes"
      />
    );
  }

  // Cancelled
  if (application.status === "CANCELLED") {
    return (
      <ApplyState
        type="warning"
        title="Application cancelled"
        description="This reservation was cancelled. You can start a new application from the homepage."
        linkTo="/"
        linkLabel="Browse classes"
      />
    );
  }

  // Calculate remaining reservation time
  const expiryTime = new Date(application.expiresAt).getTime();

  const isExpired =
    reservationExpired ||
    !Number.isFinite(expiryTime) ||
    (now !== null && now >= expiryTime);

  // Expired according to client countdown
  if (isExpired) {
    return (
      <ApplyState
        type="error"
        title="Reservation time is over"
        description="Your payment time has ended. Your seat may be released shortly. Please check availability before applying again."
        linkTo="/"
        linkLabel="Browse classes"
      />
    );
  }

  const holdId = application.holdId;

  async function handlePayment() {
    try {
      await confirmMutation.mutateAsync(holdId);

      await navigate({
        to: "/applications",
      });
    } catch {
      // Mutation error is displayed in DemoPayment.
    }
  }

  async function handleCancelReservation() {
    try {
      await cancelMutation.mutateAsync(holdId);

      await navigate({
        to: "/applications",
      });
    } catch {
      // Cancellation error is displayed in the confirmation panel.
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Page heading */}
      <div className="mb-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Classes
        </Link>
        <p className="text-sm font-semibold text-indigo-600">
          Admission application
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Complete your admission
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Your seat is temporarily reserved. Complete the payment before the
          countdown ends.
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Payment panel */}
        <aside className="order-1 lg:sticky lg:top-6 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-lg shadow-indigo-100/40">
            {/* Countdown */}
            <div className="bg-indigo-600 px-6 py-5 text-white">
              <p className="text-sm font-medium text-indigo-100">
                Complete payment before
              </p>

              <div className="mt-3">
                <ReservationCountdown
                  expiresAt={application.expiresAt}
                  onExpire={handleReservationExpired}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-indigo-100">
                Your reserved seat will be released when the timer expires.
              </p>
            </div>

            {/* Payment action */}
            <div className="p-5 sm:p-6">
              <DemoPayment
                onPay={handlePayment}
                isPending={confirmMutation.isPending}
                isDisabled={isExpired || cancelMutation.isPending}
                errorMessage={
                  confirmMutation.error instanceof Error
                    ? confirmMutation.error.message
                    : ""
                }
              />

              <div className="my-5 border-t border-slate-100" />

              {!showCancelConfirmation ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmation(true)}
                  disabled={
                    confirmMutation.isPending || cancelMutation.isPending
                  }
                  className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel reservation
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-800">
                    Cancel your reservation?
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-red-700">
                    Your reserved seat will be released and another student will
                    be able to apply for it. This action cannot be undone.
                  </p>

                  {cancelMutation.error && (
                    <p className="mt-3 text-sm text-red-700">
                      {cancelMutation.error instanceof Error
                        ? cancelMutation.error.message
                        : "Unable to cancel your reservation. Please try again."}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirmation(false)}
                      disabled={cancelMutation.isPending}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Keep
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelReservation}
                      disabled={cancelMutation.isPending}
                      className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Application details */}
        <section className="order-2 space-y-5 lg:order-1">
          <ApplyClassCard classItem={classQuery.data} />

          <ApplyStudentCard studentId={studentId} />

          {/* Instructions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Before you continue
            </h3>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>Your seat is temporarily reserved.</li>
              <li>Complete payment before the timer expires.</li>
              <li>
                Your admission is confirmed after successful payment
                confirmation.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
