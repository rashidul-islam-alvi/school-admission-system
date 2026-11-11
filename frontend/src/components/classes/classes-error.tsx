interface ClassesErrorProps {
  message: string;
  onRetry: () => void;
}

export default function ClassesError({ message, onRetry }: ClassesErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-700">Unable to load classes</p>

      <p className="mt-2 text-sm text-red-600">{message}</p>

      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
