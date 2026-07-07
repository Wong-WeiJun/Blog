import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { AxiosError } from "axios";
import { ContactForm, ContactPage } from "./ContactPage";
import { validateContactForm } from "@/lib/contact-validation";

vi.mock("@marsidev/react-turnstile", async () => {
  const { MockTurnstile } = await import("@/test/mocks/turnstile");
  return { Turnstile: MockTurnstile };
});

vi.mock("@/lib/contact", () => ({
  submitContactForm: vi.fn(),
}));

import { submitContactForm } from "@/lib/contact";

const mockedSubmitContactForm = vi.mocked(submitContactForm);

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("validateContactForm", () => {
  const validFields = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Collaboration",
    message: "I would love to collaborate on an open-source project together.",
    captchaToken: "test-token",
  };

  it("returns no errors for valid input", () => {
    expect(validateContactForm(validFields)).toEqual({});
  });

  it("requires name", () => {
    const errors = validateContactForm({ ...validFields, name: "  " });
    expect(errors.name).toBe("Please enter your name.");
  });

  it("requires a valid email", () => {
    const errors = validateContactForm({ ...validFields, email: "not-an-email" });
    expect(errors.email).toBe("Enter a valid email address.");
  });

  it("requires subject", () => {
    const errors = validateContactForm({ ...validFields, subject: "" });
    expect(errors.subject).toBe("Please enter a subject.");
  });

  it("requires message of at least 20 characters", () => {
    const errors = validateContactForm({ ...validFields, message: "too short" });
    expect(errors.message).toBe("Message must be at least 20 characters.");
  });

  it("requires captcha token", () => {
    const errors = validateContactForm({ ...validFields, captchaToken: "" });
    expect(errors.captcha).toBe("Please confirm you're not a robot.");
  });
});

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderWithProviders(<ContactForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("blocks submit and shows validation errors when fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await user.click(screen.getByTestId("turnstile-mock"));
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a subject.")).toBeInTheDocument();
    expect(screen.getByText("Message must be at least 20 characters.")).toBeInTheDocument();
    expect(mockedSubmitContactForm).not.toHaveBeenCalled();
  });

  it("keeps submit disabled until captcha is completed", () => {
    renderWithProviders(<ContactForm />);

    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("submits successfully with the correct payload", async () => {
    const user = userEvent.setup();
    mockedSubmitContactForm.mockResolvedValue({
      status: "success",
      message: "Your message has been sent successfully!",
    });

    renderWithProviders(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Subject"), "Collaboration");
    await user.type(
      screen.getByLabelText("Message"),
      "I would love to collaborate on an open-source project together.",
    );
    await user.click(screen.getByTestId("turnstile-mock"));
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockedSubmitContactForm.mock.calls[0]?.[0]).toEqual({
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Collaboration",
        message: "I would love to collaborate on an open-source project together.",
        captcha_token: "test-captcha-token",
      });
    });

    expect(await screen.findByText("Message sent!")).toBeInTheDocument();
  });

  it("shows server error when the API fails", async () => {
    const user = userEvent.setup();
    mockedSubmitContactForm.mockRejectedValue(
      new AxiosError(
        "Request failed",
        undefined,
        undefined,
        undefined,
        {
          status: 400,
          data: { detail: "Captcha verification failed. Please try again." },
        } as never,
      ),
    );

    renderWithProviders(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Subject"), "Collaboration");
    await user.type(
      screen.getByLabelText("Message"),
      "I would love to collaborate on an open-source project together.",
    );
    await user.click(screen.getByTestId("turnstile-mock"));
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Captcha verification failed. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });
});

describe("ContactPage", () => {
  it("renders the contact page layout", () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /let's start a/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /blog/i })).toBeInTheDocument();
  });
});
