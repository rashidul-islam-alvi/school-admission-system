import { z } from "zod";

export const classSchema = z.object({
  name: z
    .string()
    .min(3, "Class name must be at least 3 characters.")
    .max(100, "Class name cannot exceed 100 characters."),
  totalSeats: z.coerce
    .number()
    .int("Seat count must be a whole number.")
    .min(1, "At least one seat is required.")
    .max(10000, "Seat count is too large."),
});

export type ClassFormInput = z.input<typeof classSchema>;
export type ClassFormData = z.output<typeof classSchema>;
