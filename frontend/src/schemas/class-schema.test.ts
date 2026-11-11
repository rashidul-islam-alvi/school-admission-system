import { describe, expect, it } from "vitest";
import { classSchema } from "./class-schema";

describe("classSchema", () => {
  it("accepts valid class information", () => {
    const result = classSchema.safeParse({
      name: "Class 6 - Morning",
      totalSeats: "40",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.totalSeats).toBe(40);
    }
  });

  it("rejects a class name shorter than 3 characters", () => {
    const result = classSchema.safeParse({
      name: "A",
      totalSeats: 40,
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero seats", () => {
    const result = classSchema.safeParse({
      name: "Class 6",
      totalSeats: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects decimal seat counts", () => {
    const result = classSchema.safeParse({
      name: "Class 6",
      totalSeats: 10.5,
    });

    expect(result.success).toBe(false);
  });

  it("rejects seat counts greater than 10000", () => {
    const result = classSchema.safeParse({
      name: "Class 6",
      totalSeats: 10001,
    });

    expect(result.success).toBe(false);
  });
});
