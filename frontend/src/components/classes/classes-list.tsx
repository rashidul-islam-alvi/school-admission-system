import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";

import type { ClassItem, StudentApplication } from "../../types";
import { holdService } from "../../services/hold-service";
import ClassCard from "./classes-card";

interface ClassListProps {
  classes: ClassItem[];
}

type FilterType = "all" | "available" | "full";

export default function ClassList({ classes }: ClassListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: applications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: holdService.getMyApplications,
    refetchInterval: 5000,
  });

  const getApplicationForClass = (
    classId: string,
  ): StudentApplication | undefined => {
    const classApplications = applications.filter(
      (application) => application.classId === classId,
    );

    // A confirmed application takes priority.
    const confirmed = classApplications.find(
      (application) => application.status === "CONFIRMED",
    );

    if (confirmed) return confirmed;

    // Otherwise, return the active hold.
    return classApplications.find(
      (application) =>
        application.status === "HELD" &&
        new Date(application.expiresAt).getTime() > Date.now(),
    );
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "available"
            ? item.availableSeats > 0
            : item.availableSeats <= 0;

      return matchesSearch && matchesFilter;
    });
  }, [classes, search, filter]);

  const availableCount = classes.filter(
    (item) => item.availableSeats > 0,
  ).length;

  const fullCount = classes.filter((item) => item.availableSeats <= 0).length;

  const filters: {
    label: string;
    value: FilterType;
    count: number;
  }[] = [
    { label: "All Classes", value: "all", count: classes.length },
    { label: "Available", value: "available", count: availableCount },
    { label: "Fully Booked", value: "full", count: fullCount },
  ];

  return (
    <div className="space-y-5">
      {/* Filters and new class */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-6 overflow-x-auto">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                filter === item.value
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filter === item.value
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <Link
          to="/admin/create-class"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          New Class
        </Link>
      </div>

      {/* Search and filter toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-slate-700">
          {filter === "all"
            ? "All Classes"
            : filter === "available"
              ? "Available Classes"
              : "Fully Booked Classes"}

          <span className="ml-2 font-normal text-slate-400">
            ({filteredClasses.length} results)
          </span>
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search classes..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            title="Reset filters"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Reset</span>
            <Filter size={15} className="sm:hidden" />
          </button>
        </div>
      </div>

      {/* Directory table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Desktop column headings */}
        <div className="hidden grid-cols-[minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(120px,0.8fr)_110px_130px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
          <span>Class name</span>
          <span>Total seats</span>
          <span>Held</span>
          <span>Confirmed</span>
          <span>Available</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {filteredClasses.length > 0 ? (
          filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              application={getApplicationForClass(item.id)}
            />
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search size={21} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No classes found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try another search or change your availability filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
