---
title: Supabase Auth error handling must expect throws, not just returned errors
date: 2026-07-02
category: runtime-errors
module: panitia-login
problem_type: runtime_error
component: authentication
symptoms:
  - "Submit button stayed permanently disabled with a stuck loading spinner after login failure in strict privacy/incognito browser settings"
  - "No error message shown to user when signInWithPassword threw instead of returning an error"
  - "Network failures, 5xx server errors, and 429 rate-limit responses all displayed the generic 'Email atau password salah' (wrong credentials) message, misleading users during outages"
root_cause: wrong_api
resolution_type: code_fix
severity: medium
related_components: [frontend, next-js]
tags: [supabase, auth-js, error-handling, unhandled-rejection, react, signinwithpassword]
---

# Supabase Auth error handling must expect throws, not just returned errors

## Problem

The panitia login page (`src/app/(panitia)/login/page.tsx`) called `supabase.auth.signInWithPassword({ email, password })` without a try/catch, and mapped every returned auth error — wrong credentials, network failures, Supabase outages, rate-limiting — to the same generic "Email atau password salah" message.

## Symptoms

- If `signInWithPassword` ever rejects (rather than resolving with `{ data, error }`), the submit handler throws mid-execution: `isSubmitting` was already set to `true` before the await, so it never gets reset to `false`. The submit button stays disabled with a stuck spinner and no error message appears — the form becomes permanently unusable until the page is reloaded.
- Users hitting a transient network blip or a Supabase outage see "Email atau password salah" (wrong email or password) even though their credentials are correct, leading them to retry with different passwords, potentially locking their account or wasting time troubleshooting the wrong problem.

## What Didn't Work

This wasn't caught through failed debugging attempts — it was flagged during code review before shipping. The naive initial implementation looked reasonable at first glance:

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  setErrorMessage(null);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setErrorMessage(GENERIC_ERROR_MESSAGE); // "Email atau password salah."
    setIsSubmitting(false);
    return;
  }

  router.push("/events");
}
```

It looked safe because the Supabase JS client's documented pattern is "always returns `{ data, error }`, never throws" — so skipping a try/catch felt consistent with the SDK's contract, and collapsing every error case into one generic, security-conscious message ("don't reveal which field was wrong") felt like a deliberate, complete design choice rather than an oversight. Both assumptions were only partially true: the "never throws" contract only holds for `AuthError` instances, and "don't reveal field-level detail" should only apply to genuine credential mismatches, not to infrastructure failures.

## Solution

```tsx
const INVALID_CREDENTIALS_MESSAGE = "Email atau password salah.";
const UNEXPECTED_ERROR_MESSAGE = "Terjadi kesalahan. Silakan coba lagi.";

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  setErrorMessage(null);

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Only "wrong email or password" gets the field-agnostic message.
      // Network/server/rate-limit failures get a distinct message so
      // panitia don't mistake an outage for a credentials mistake.
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
```

Two independent changes, both required:

1. The entire `signInWithPassword` call plus its result handling is wrapped in try/catch, so any rethrown exception re-enables the form (`setIsSubmitting(false)`) and shows a generic error instead of leaving the UI permanently locked.
2. The error branch now discriminates on `error.code === "invalid_credentials"` rather than collapsing every `error` into the same message — only true credential mismatches get `INVALID_CREDENTIALS_MESSAGE`; everything else (network, server, rate-limit) gets `UNEXPECTED_ERROR_MESSAGE`.

Test coverage was added for the exact failure mode the original code didn't handle: `signInWithPassword` rejecting via `mockRejectedValue`, asserting the submit button re-enables and an error message is shown.

## Why This Works

Verified directly against the installed `@supabase/auth-js` package source (`node_modules/@supabase/auth-js`):

- `signInWithPassword`'s internals only catch and return-as-`{ data, error }` exceptions that pass an internal `isAuthError()` check (i.e., instances of `AuthError`). Any other thrown exception — e.g., a storage-access exception when auth-js tries to persist the session under strict browser privacy/incognito settings, or an unexpected fetch/runtime failure — is rethrown, not swallowed. Code that treats "the SDK always returns `{ data, error }`" as an absolute guarantee is wrong in exactly this edge case, and without a try/catch, that rethrown exception becomes an unhandled promise rejection inside the event handler — state already set (`isSubmitting = true`) never gets unwound.
- `AuthApiError`, the concrete error class Supabase's auth-js returns for API-level failures, carries a `.code` field with specific stable string values like `"invalid_credentials"` (verified in `node_modules/@supabase/auth-js/dist/module/lib/errors.js`). The naive implementation ignored this field entirely and treated the mere presence of `error` as sufficient to mean "wrong credentials," conflating a specific failure mode (bad password) with the general case (any failure at all). Branching on `.code` restores the distinction the original single-message design was trying to preserve for real credential mismatches, without over-applying it to unrelated failures.

## Prevention

- Treat any third-party SDK function that claims to return errors as `{ data, error }` as **not** throw-free unless you've personally verified every internal throw path is caught — check the library source, don't trust the documented happy-path contract. Wrap the call in try/catch by default; it's cheap insurance.
- When a state flag like `isSubmitting`/`isLoading` is set before an `await`, always pair it with error handling (try/catch, `.finally()`, or equivalent) that guarantees the flag gets reset on every exit path, including thrown exceptions — not just the `error` field in a resolved value.
- For Supabase Auth errors, branch on `error.code` (a stable, documented value on `AuthApiError`), never on `error.message` (free text, not a stable contract) and never on HTTP status alone (too coarse to distinguish "bad password" from "rate limited" from "server error").
- This pattern is not specific to `signInWithPassword` — apply the same try/catch + `.code`-based branching to every other `supabase.auth.*` call this project adds (`signUp`, `resetPasswordForEmail`, `updateUser`, `signOut`, etc.), since they share the same auth-js error contract.
- Test-first scenario that would have caught this: mock the SDK call with `mockRejectedValue(new Error("..."))` (a non-`AuthError` rejection, not just a resolved `{ error }`), then assert the submit button re-enables (`isSubmitting` returns to `false`) and a user-visible error message appears. A test that only exercises the resolved-`{ error }` path will pass on the buggy version and give false confidence.
- Watch for stale scaffold defaults conflicting with later design decisions: in the same session, the login page rendered with a dark background instead of the intended white/gray-with-red-accents palette because `src/app/globals.css` still had the default `create-next-app` `@media (prefers-color-scheme: dark)` block, which silently overrode the light CSS custom properties whenever the OS was in dark mode. This predated the project's deliberate red/white/gray design tokens (see `CLAUDE.md`'s "Styling & Design Tokens" section) and was never intentionally kept. Fixed by deleting the block. When a page's rendering doesn't match the intended design system, check for leftover scaffold CSS/config before assuming the bug is in the new code.

## Related Issues

- None found — this is the first documented solution in this repo's `docs/solutions/`.
