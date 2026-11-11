import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { holdService } from "../services/hold-service";

export function useApplications() {
  const queryClient = useQueryClient();
  const studentId = localStorage.getItem("studentId");

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const applicationsQuery = useQuery({
    queryKey: ["applications", studentId],
    queryFn: holdService.getMyApplications,
    enabled: Boolean(studentId && /^\d{17}$/.test(studentId)),
    refetchInterval: 5000,
  });

  function refreshData() {
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  }

  const confirmMutation = useMutation({
    mutationFn: holdService.confirm,

    onSuccess: () => {
      setActionError("");
      setActionMessage("Admission confirmed successfully!");
      refreshData();
    },

    onError: (error: Error) => {
      setActionMessage("");
      setActionError(error.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: holdService.cancel,

    onSuccess: () => {
      setActionError("");
      setActionMessage("Your reservation has been cancelled.");
      refreshData();
    },

    onError: (error: Error) => {
      setActionMessage("");
      setActionError(error.message);
    },
  });

  return {
    studentId,
    applications: applicationsQuery.data ?? [],
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    refetch: applicationsQuery.refetch,
    isFetching: applicationsQuery.isFetching,

    actionMessage,
    actionError,

    confirm: confirmMutation.mutate,
    cancel: cancelMutation.mutate,

    confirmingId: confirmMutation.isPending ? confirmMutation.variables : null,

    cancellingId: cancelMutation.isPending ? cancelMutation.variables : null,
  };
}
