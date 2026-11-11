import api from "./api";
import type { Hold, StudentApplication } from "../types";

export const holdService = {
  create: (classId: string) => api.post<Hold>(`/classes/${classId}/holds`),

  getById: (holdId: string) => api.get<Hold>(`/holds/${holdId}`),

  confirm: (holdId: string) =>
    api.post<{ holdId: string; status: string }>(`/holds/${holdId}/confirm`),

  cancel: (holdId: string) => api.delete<void>(`/holds/${holdId}`),

  getMyApplications: () => api.get<StudentApplication[]>("/me/holds"),
};
