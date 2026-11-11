import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ADMIN_ID = "12345678901234567";

async function renderComponent() {
  const { default: StudentIdentification } =
    await import("./student-identification");

  return render(<StudentIdentification />);
}

describe("StudentIdentification", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.stubEnv("VITE_ADMIN_ID", ADMIN_ID);
  });

  it("rejects an ID that is not exactly 17 digits", async () => {
    const user = userEvent.setup();

    await renderComponent();

    await user.type(
      screen.getByLabelText(/student birth registration number/i),
      "123456789",
    );

    await user.click(screen.getByRole("button", { name: /save id/i }));

    expect(
      screen.getByText(
        /please enter a valid 17-digit birth registration number/i,
      ),
    ).toBeInTheDocument();

    expect(localStorage.getItem("studentId")).toBeNull();
  });

  it("saves a valid student ID in localStorage", async () => {
    const user = userEvent.setup();
    const studentId = "98765432109876543";

    await renderComponent();

    await user.type(
      screen.getByLabelText(/student birth registration number/i),
      studentId,
    );

    await user.click(screen.getByRole("button", { name: /save id/i }));

    expect(localStorage.getItem("studentId")).toBe(studentId);

    expect(
      screen.getByText(/student identification saved successfully/i),
    ).toBeInTheDocument();
  });

  it("recognizes the configured administrator ID", async () => {
    localStorage.setItem("studentId", ADMIN_ID);

    await renderComponent();

    expect(
      screen.getByText("Administrator identification"),
    ).toBeInTheDocument();

    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    expect(
      screen.getByText("Administrator ID recognized."),
    ).toBeInTheDocument();
  });

  it("recognizes an ordinary ID as a student ID", async () => {
    localStorage.setItem("studentId", "98765432109876543");

    await renderComponent();

    expect(screen.getByText("Student identification")).toBeInTheDocument();

    expect(screen.getByText("ID SAVED")).toBeInTheDocument();

    expect(
      screen.getByText("Student identification saved successfully."),
    ).toBeInTheDocument();
  });
});
