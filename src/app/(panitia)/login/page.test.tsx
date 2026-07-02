import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInWithPassword = vi.fn();
const push = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    push.mockReset();
  });

  it("calls signInWithPassword with entered credentials and redirects on success", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "panitia@tuscup.test");
    await user.type(screen.getByLabelText(/password/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "panitia@tuscup.test",
        password: "correct-password",
      });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/events");
    });
  });

  it("shows a disabled button with a spinner while the request is pending", async () => {
    let resolveSignIn: (value: {
      data: object;
      error: { message: string } | null;
    }) => void = () => {};
    signInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      })
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "panitia@tuscup.test");
    await user.type(screen.getByLabelText(/password/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    const button = screen.getByRole("button", { name: /masuk/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId("login-spinner")).toBeInTheDocument();

    // Resolve with a failure so the button re-enables here (a success
    // resolve navigates away instead, per the redirect test above).
    resolveSignIn({ data: {}, error: { message: "Invalid login credentials" } });
    await waitFor(() => expect(button).not.toBeDisabled());
    expect(screen.queryByTestId("login-spinner")).not.toBeInTheDocument();
  });

  it("does not call signInWithPassword when email or password is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /masuk/i }));

    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("blocks submission for a malformed email via HTML5 validation", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.type).toBe("email");
    expect(emailInput.required).toBe(true);
  });

  it("shows a generic error message on failed login without revealing which field was wrong", async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "panitia@tuscup.test");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    const error = await screen.findByRole("alert");
    // Generic message names both fields together; it must not single out
    // just one (e.g. "email not found" or "wrong password" alone), which
    // would leak which field was incorrect.
    expect(error).toHaveTextContent(/email atau password salah/i);
    expect(error).not.toHaveTextContent(/email tidak ditemukan/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("does not submit a second time while a request is already in flight", async () => {
    let resolveSignIn: (value: { data: object; error: null }) => void = () => {};
    signInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      })
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "panitia@tuscup.test");
    await user.type(screen.getByLabelText(/password/i), "correct-password");
    const button = screen.getByRole("button", { name: /masuk/i });
    await user.click(button);
    await user.click(button);

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
    resolveSignIn({ data: {}, error: null });
  });
});
