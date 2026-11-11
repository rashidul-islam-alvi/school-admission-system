import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#111827] px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Admission Session 2026–27
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your next chapter
          <span className="block text-indigo-400">starts here.</span>
        </h1>

        <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
          Find your preferred class, reserve your seat, and complete your
          admission through a simple and transparent process.
        </p>

        <a
          href="#available-classes"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Explore classes
          <ArrowRight size={17} />
        </a>
      </div>
    </section>
  );
}
