import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
  const React = await import("react");

  return {
    createRootRoute: (options: unknown) => ({ options }),
    Link: ({ children }: { children: React.ReactNode }) =>
      React.createElement("a", null, children),
    Outlet: () => null,
    useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
      select({ location: { pathname: "/" } }),
  };
});

import { Route } from "./__root";

const RootLayout = (
  Route as unknown as {
    options: { component: React.ComponentType };
  }
).options.component;

describe("Admin navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_ADMIN_ID", "12345678901234567");
  });

  it("shows Create Class to the administrator", async () => {
    localStorage.setItem("studentId", "12345678901234567");

    render(<RootLayout />);

    expect(await screen.findByText("Create Class")).toBeInTheDocument();
  });

  it("does not show Create Class to a student", async () => {
    localStorage.setItem("studentId", "98765432109876543");

    render(<RootLayout />);

    await waitFor(() => {
      expect(screen.queryByText("Create Class")).not.toBeInTheDocument();
    });
  });
});
