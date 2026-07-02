"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const INVALID_CREDENTIALS_MESSAGE = "Email atau password salah.";
const UNEXPECTED_ERROR_MESSAGE = "Terjadi kesalahan. Silakan coba lagi.";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Only "wrong email or password" gets the field-agnostic message
        // (R4). Network/server/rate-limit failures get a distinct message
        // so panitia don't mistake an outage for a credentials mistake.
        setErrorMessage(
          error.code === "invalid_credentials"
            ? INVALID_CREDENTIALS_MESSAGE
            : UNEXPECTED_ERROR_MESSAGE
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/events");
    } catch {
      setErrorMessage(UNEXPECTED_ERROR_MESSAGE);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-background shadow-lg">
        <div className="flex h-28 flex-col items-center justify-center gap-2 bg-linear-to-br from-red to-red-strong text-background">
          <Trophy className="size-6" />
          <span className="text-lg font-semibold tracking-tight">Tus-Cup</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <h1 className="text-base font-semibold">Masuk sebagai Panitia</h1>

          {errorMessage ? (
            <p
              role="alert"
              className="animate-in fade-in slide-in-from-top-1 rounded-sm bg-red-strong-bg px-3 py-2 text-xs text-red-strong duration-150"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-red focus:ring-2 focus:ring-red-bg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-red focus:ring-2 focus:ring-red-bg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-red px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-red-strong disabled:opacity-70 disabled:hover:bg-red"
          >
            {isSubmitting ? (
              <Loader2 data-testid="login-spinner" className="size-4 animate-spin" />
            ) : null}
            Masuk
          </button>

          {/* Not yet wired to a reset flow (out of scope per plan R5) —
              rendered as inert text rather than href="#" to avoid an
              unintended scroll/hash side effect on click. */}
          <span className="text-center text-xs text-text-muted" aria-disabled="true">
            Lupa password?
          </span>
        </form>
      </div>
    </main>
  );
}
