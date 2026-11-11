interface ApplicationFeedbackProps {
  successMessage: string;
  errorMessage: string;
}

export default function ApplicationFeedback({
  successMessage,
  errorMessage,
}: ApplicationFeedbackProps) {
  const message = errorMessage || successMessage;

  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
        errorMessage
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message}
    </div>
  );
}
