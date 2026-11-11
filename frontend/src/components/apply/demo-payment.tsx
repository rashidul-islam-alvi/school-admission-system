import { CreditCard, LockKeyhole } from "lucide-react";

interface DemoPaymentProps {
  onPay: () => void;
  isPending: boolean;
  isDisabled: boolean;
  errorMessage: string;
}

export default function DemoPayment({
  onPay,
  isPending,
  isDisabled,
  errorMessage,
}: DemoPaymentProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <CreditCard size={22} />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">Admission payment</h2>
          <p className="text-xs text-slate-500">
            Complete the demo payment to confirm your admission.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <LockKeyhole size={16} />
          <span className="text-sm font-semibold">
            Demo payment environment
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This is a simulated payment for demonstration purposes. No real money
          will be charged.
        </p>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onPay}
        disabled={isDisabled || isPending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending ? "Processing payment..." : "Simulate Payment & Confirm"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Your admission will be confirmed only after the server successfully
        processes the confirmation.
      </p>
    </section>
  );
}
