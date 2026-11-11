import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

interface ApplyStateProps {
  type: "error" | "success" | "warning";
  title: string;
  description: string;
  linkTo?: "/" | "/applications";
  linkLabel?: string;
}

export default function ApplyState({
  type,
  title,
  description,
  linkTo = "/applications",
  linkLabel = "View my applications",
}: ApplyStateProps) {
  const styles = {
    error: {
      container: "border-red-200 bg-red-50",
      icon: "text-red-600",
      text: "text-red-700",
      Icon: AlertCircle,
    },
    success: {
      container: "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-600",
      text: "text-emerald-700",
      Icon: CheckCircle2,
    },
    warning: {
      container: "border-amber-200 bg-amber-50",
      icon: "text-amber-600",
      text: "text-amber-700",
      Icon: Clock3,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border p-8 text-center ${style.container}`}>
      <Icon size={38} className={`mx-auto ${style.icon}`} />

      <h2 className={`mt-4 text-xl font-bold ${style.text}`}>{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      <Link
        to={linkTo}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
