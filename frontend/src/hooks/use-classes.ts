import { useQuery } from "@tanstack/react-query";
import { classService } from "../services/class-service";

export function useClasses() {
  const query = useQuery({
    queryKey: ["classes"],
    queryFn: classService.getAll,
    refetchInterval: 5000,
  });

  return {
    classes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
