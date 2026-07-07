import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ResetPasswordPage } from "./ResetPasswordPage";

const resetPasswordMock = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    resetPassword: resetPasswordMock,
    isResettingPassword: false,
  }),
}));

function renderPage(initialPath = "/reset-password?token=test-token") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPasswordMock.mockImplementation(
      (_token: string, _password: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
    );
  });

  it("shows error when token is missing", () => {
    renderPage("/reset-password");

    expect(screen.getByText(/invalid or missing a token/i)).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("New password"), "Password1!");
    await user.type(screen.getByLabelText("Confirm password"), "Different1!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("submits successfully with token and password", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("New password"), "Password1!");
    await user.type(screen.getByLabelText("Confirm password"), "Password1!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith(
        "test-token",
        "Password1!",
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    expect(await screen.findByText("Password updated")).toBeInTheDocument();
  });

  it("shows server error when reset fails", async () => {
    const user = userEvent.setup();
    resetPasswordMock.mockImplementation(
      (_token: string, _password: string, options?: { onError?: (err: unknown) => void }) => {
        options?.onError?.(
          new AxiosError(
            "Request failed",
            undefined,
            undefined,
            undefined,
            {
              status: 400,
              data: { detail: "Invalid token" },
            } as never,
          ),
        );
      },
    );

    renderPage();

    await user.type(screen.getByLabelText("New password"), "Password1!");
    await user.type(screen.getByLabelText("Confirm password"), "Password1!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Invalid token")).toBeInTheDocument();
  });
});
