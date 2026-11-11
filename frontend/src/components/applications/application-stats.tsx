interface ApplicationStatsProps {
  total: number;
  pending: number;
  confirmed: number;
}

export default function ApplicationStats({
  total,
  pending,
  confirmed,
}: ApplicationStatsProps) {
  const stats = [
    {
      label: "Total applications",
      value: total,
      color: "text-slate-900",
    },
    {
      label: "Pending reservations",
      value: pending,
      color: "text-amber-600",
    },
    {
      label: "Confirmed admissions",
      value: confirmed,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="mb-7 grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
