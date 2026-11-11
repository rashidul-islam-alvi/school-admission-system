import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService } from "../services/class-service";
import { holdService } from "../services/hold-service";

export function useApplyReservation(classId: string) {
  const queryClient = useQueryClient();

  const classQuery = useQuery({
    queryKey: ["classes", classId],
    queryFn: () => classService.getById(classId),
    enabled: Boolean(classId),
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => holdService.getMyApplications(),
    refetchInterval: 5000,
  });

  const application = applicationsQuery.data
    ?.filter((item) => item.classId === classId)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime(),
    )[0];

  const confirmMutation = useMutation({
    mutationFn: (holdId: string) => holdService.confirm(holdId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (holdId: string) => holdService.cancel(holdId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]);
    },
  });

  return {
    classQuery,
    applicationsQuery,
    application,
    confirmMutation,
    cancelMutation,
  };
}
