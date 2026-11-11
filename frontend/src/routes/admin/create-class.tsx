import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { classService } from "../../services/class-service";
import {
  classSchema,
  type ClassFormInput,
  type ClassFormData,
} from "../../schemas/class-schema";

export const Route = createFileRoute("/admin/create-class")({
  component: CreateClassPage,
});

function CreateClassPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = () => {
      const savedId = localStorage.getItem("studentId");
      const adminId = import.meta.env.VITE_ADMIN_ID;
      const allowed = Boolean(adminId && savedId === adminId);

      setAuthorized(allowed);

      if (!allowed) {
        navigate({ to: "/", replace: true });
      }
    };

    checkAdmin();

    window.addEventListener("identityChanged", checkAdmin);

    return () => {
      window.removeEventListener("identityChanged", checkAdmin);
    };
  }, [navigate]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormInput, unknown, ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      totalSeats: 40,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ClassFormData) => classService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      reset();
      await navigate({ to: "/" });
    },
  });

  const onSubmit = (data: ClassFormData) => {
    createMutation.mutate(data);
  };

  if (authorized !== true) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to classes
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-900 px-6 py-8 text-white sm:px-9">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <BookOpen size={24} />
          </div>
          <p className="text-sm font-medium text-indigo-300">Administration</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Create a new class
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
            Set up an admission class and define how many students can reserve
            seats.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 p-6 sm:p-9"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Class name
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="e.g. Class 1 - Morning"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="totalSeats"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Total available seats
            </label>
            <input
              id="totalSeats"
              type="number"
              min="1"
              {...register("totalSeats")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
            {errors.totalSeats && (
              <p className="mt-2 text-sm text-red-600">
                {errors.totalSeats.message}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Students will reserve seats from this capacity.
            </p>
          </div>

          {createMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Unable to create the class. Please try again."}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating class...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Create class
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
