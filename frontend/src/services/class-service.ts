import api from "./api";
import type { ClassItem } from "../types";

export const classService = {
  getAll: () => api.get<ClassItem[]>("/classes"),

  getById: (classId: string) => api.get<ClassItem>(`/classes/${classId}`),

  create: (payload: { name: string; totalSeats: number }) =>
    api.post<ClassItem>("/classes", payload),
};
