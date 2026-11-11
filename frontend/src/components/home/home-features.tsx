import { CheckCircle2, RefreshCw, Users } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Fair seat allocation",
    description: "Seats are reserved on a first-come-first-served basis.",
  },
  {
    icon: Users,
    title: "Simple identification",
    description: "Use your birth registration number to manage applications.",
  },
  {
    icon: RefreshCw,
    title: "Live availability",
    description: "Seat availability refreshes automatically.",
  },
];

export default function HomeFeatures() {
  return (
    <section className="mt-12 grid gap-4 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <Icon className="text-indigo-600" size={22} />

          <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      ))}
    </section>
  );
}
