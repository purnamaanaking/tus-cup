"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const GENERIC_ERROR_MESSAGE = "Email atau password salah.";

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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(GENERIC_ERROR_MESSAGE);
      setIsSubmitting(false);
      return;
    }

    router.push("/events");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-background shadow-sm">
        <div className="flex h-24 items-center justify-center bg-red text-background">
          <span className="text-lg font-semibold">Tus-Cup</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <h1 className="text-base font-semibold">Masuk sebagai Panitia</h1>

          {errorMessage ? (
            <p role="alert" className="text-xs text-red-strong">
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
              className="rounded-sm border border-border px-3 py-2 text-sm"
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
              className="rounded-sm border border-border px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-red px-4 py-2 text-sm font-semibold text-background disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 data-testid="login-spinner" className="size-4 animate-spin" />
            ) : null}
            Masuk
          </button>

          <a href="#" className="text-xs text-text-muted">
            Lupa password?
          </a>
        </form>
      </div>
    </main>
  );
}
