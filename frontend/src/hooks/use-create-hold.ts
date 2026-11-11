import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { holdService } from "../services/hold-service";
import type { Hold } from "../types";

export function useCreateHold() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (classId: string) => holdService.create(classId),
  });

  async function createHold(classId: string): Promise<Hold | null> {
    const studentId = localStorage.getItem("studentId");

    if (!studentId || !/^\d{17}$/.test(studentId)) {
      setErrorMessage(
        "Please save a valid 17-digit Student ID before applying.",
      );
      return null;
    }

    setErrorMessage("");

    try {
      const hold = await mutation.mutateAsync(classId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
      ]);

      return hold;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to reserve your seat.",
      );
      return null;
    }
  }

  return {
    createHold,
    errorMessage,
    isPending: mutation.isPending,
  };
}
