---
title: Panitia Login UI - Plan
type: feat
date: 2026-07-02
topic: panitia-login-ui
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Panitia Login UI - Plan

## Goal Capsule

- **Objective:** Give panitia a login form (email + password via Supabase Auth) so they can access the dashboard, scoped strictly to the form's appearance and interaction — not the account lifecycle (signup, invite, password reset) behind it.
- **Product authority:** `STRATEGY.md` — panitia/admin as the sole authenticated actor. Gates access to [docs/plans/2026-07-02-001-feat-panitia-dashboard-ui-plan.md](2026-07-02-001-feat-panitia-dashboard-ui-plan.md)'s control room, which assumes "Supabase Auth email+password exists and is usable" per the Live Data Engine plan's Scope Boundaries.
- **Execution profile:** Lightweight. A single form page over an already-decided auth provider (Supabase Auth) and already-established design tokens — no new infrastructure.
- **Open blockers:** None — Product Contract preservation: unchanged. Panitia account lifecycle (signup/invite/reset) remains a separate, unscoped product decision (see Scope Boundaries).

---

## Product Contract

### Summary

A centered login card with a visual banner above the form (illustration/brand space), an email field, a password field, and a "Masuk" submit button. Submitting shows a disabled button with an inline spinner while the request is in flight. A failed login shows one generic error message above the form fields, not tied to either field. A "Lupa password?" link is present but not wired to any flow. Successful login redirects to the panitia's list of managed Events/Tournaments (a separate, unscoped page).

### Problem Frame

Every panitia-facing plan so far (Live Data Engine, Panitia Dashboard UI) assumes an authenticated panitia session exists, but none of them designed the login screen itself — it was explicitly deferred as account-lifecycle work. This plan closes only the visual/interaction gap: what the login form looks like and how it behaves, without resolving how a panitia account is created in the first place (self-signup vs. invite), which remains a separate, unscoped product decision.

### Key Decisions

- **Login error is a single generic message above the form, not field-specific.** Standard security practice — a per-field error ("email not found" vs "wrong password") would let an attacker enumerate which emails have accounts. The form always says something equivalent to "email or password is incorrect."
- **The submit button shows a disabled state with an inline spinner while the request is pending**, rather than just relabeling its text. Prevents double-submission and gives an unambiguous busy signal.
- **"Lupa password?" is present in the UI but not functionally wired to a reset flow.** Consistent with this plan's scope boundary — password reset, like signup/invite, is account-lifecycle work this plan does not resolve. The link exists visually so the form doesn't look incomplete, but clicking it has no defined behavior yet.
- **The card layout uses a banner/illustration area above the form fields**, rather than a bare form-only card or a two-panel split-screen layout. A middle ground: still a single-column form (works on mobile), but leaves room for product identity above the fields.

### Actors

- A1. **Panitia/admin** — the only user of this form, per the Live Data Engine plan's A1.

### Requirements

**Form layout**

- R1. The login page shows a centered card with a banner/illustration area above an email field, a password field, and a submit button.

**Submission behavior**

- R2. Submitting the form with valid credentials authenticates the panitia via Supabase Auth and redirects to the panitia's Event/Tournament list.
- R3. While the submission is in flight, the submit button is disabled and shows an inline spinner.
- R4. A failed login (wrong email or password) shows one generic error message above the form fields — the message does not indicate whether the email exists or the password was wrong.

**Non-functional elements**

- R5. A "Lupa password?" link is present near the password field but has no defined click behavior in this plan's scope.

### Key Flows

- F1. **Panitia logs in successfully**
  - **Trigger:** Panitia opens the login page and enters valid credentials.
  - **Actors:** A1
  - **Steps:** Panitia enters email and password (R1) → submits → button shows disabled/spinner state (R3) → Supabase Auth confirms credentials → panitia is redirected to their Event/Tournament list (R2).
  - **Covers:** R1, R2, R3

- F2. **Panitia enters wrong credentials**
  - **Trigger:** Panitia submits an incorrect email or password.
  - **Actors:** A1
  - **Steps:** Panitia submits (R1) → button shows disabled/spinner state (R3) → Supabase Auth rejects the credentials → generic error message appears above the form (R4) → panitia can retry.
  - **Covers:** R1, R3, R4

### Scope Boundaries

**Deferred for later**

- Panitia account creation (self-signup vs. invite-only) — an unresolved product decision that determines whether a "sign up" path needs to exist alongside this login form.
- Password reset flow — the "Lupa password?" link (R5) has no behavior defined until this is scoped.
- The panitia's Event/Tournament list page (the post-login redirect target, R2) — does not exist as a plan yet; this login plan only assumes it as a destination.

**Outside this feature's identity**

- Any account-management surface (profile editing, email change) — this plan is the login form only.

---

## Planning Contract

### Key Technical Decisions

- **KTD1. Client-side validation is HTML5 native (`required`, `type="email"`) only — no validation library.** Sufficient for two fields; a library would be unjustified overhead for this scope. Credential correctness (R4) is validated server-side by Supabase Auth, not duplicated client-side.
- **KTD2. The entire login page is a single Client Component, not split into a Server Component wrapper with a Client Component form.** Unlike the Live View UI and Panitia Dashboard UI plans, this page has no data to fetch server-side before the form renders — the minimal-client-boundary pattern from those plans doesn't reduce anything meaningful here, so the added file split isn't worth it.
- **KTD3. The submit handler calls Supabase Auth's `signInWithPassword` directly from the client**, using the same Supabase client instance established in the Live Data Engine plan's U1, rather than routing through a Server Action. Matches Supabase's standard client-side auth pattern and keeps the session cookie/token handling in the client SDK's hands.

### Assumptions

- A Supabase client instance is already initialized per the Live Data Engine plan's U1 (`src/lib/supabase/`); this plan does not create a new one.
- The redirect target after successful login (`R2`) is a placeholder route until the Event/Tournament list plan exists — this unit points at a route path but does not build the destination page.

---

## Implementation Units

### U1. Login page and form

- **Goal:** Build the centered login card — banner, email/password fields, submit button with loading state, generic error display, and the non-functional "Lupa password?" link.
- **Requirements:** R1, R2, R3, R4, R5 (A1)
- **Dependencies:** Live Data Engine plan's U1 (Supabase client instance).
- **Files:**
  - `src/app/(panitia)/login/page.tsx` (new)
  - `src/app/(panitia)/login/page.test.tsx` (new)
- **Approach:** A single `'use client'` page (KTD2) with local state for email, password, `isSubmitting`, and `errorMessage`. The banner area, card, and fields use the design tokens and spacing/typography conventions already established in `CLAUDE.md` and `src/app/globals.css`. Submit handler calls `supabase.auth.signInWithPassword` (KTD3); on success, redirects to the (placeholder) Event/Tournament list route; on failure, sets `errorMessage` to a fixed generic string and clears `isSubmitting`. Email/password fields use HTML5 `required`/`type="email"` (KTD1).
- **Patterns to follow:** Design tokens from `src/app/globals.css` (color, radius); component conventions from `CLAUDE.md`'s Styling & Design Tokens section (spacing, typography, icon sizing via `lucide-react` for the spinner icon).
- **Test scenarios:**
  - Happy path: submitting valid credentials calls `signInWithPassword` with the entered email/password and, on success, triggers the redirect.
  - Happy path: while the submit request is pending, the button is disabled and renders a spinner.
  - Edge case: submitting with an empty email or password field is blocked by HTML5 validation and never calls `signInWithPassword` (KTD1).
  - Edge case: submitting a malformed email (no `@`) is blocked by HTML5 `type="email"` validation.
  - Error path: `signInWithPassword` rejecting (wrong credentials) sets the generic error message and does not reveal which field was wrong.
  - Error path: a second submit while one is already in flight is a no-op (button is disabled per R3).
- **Verification:** Component unit tests mocking the Supabase client's `signInWithPassword`, covering all scenarios above.

---

## Verification Contract

| Command | Applies to | Notes |
|---|---|---|
| `npm run lint` | U1 | ESLint via `eslint.config.mjs`. |
| `npx tsc --noEmit` | U1 | Strict-mode type check per `tsconfig.json`. |
| `npx vitest run` | U1 | Vitest + React Testing Library, per the Live View UI plan's KTD6. |

## Definition of Done

- U1 implemented, with all test scenarios passing.
- `npm run lint` and `npx tsc --noEmit` pass with no errors.
- Manual check: submitting valid Supabase Auth credentials redirects; submitting invalid credentials shows the generic error without revealing which field was wrong.
- No dead-end or experimental code from abandoned approaches remains in the diff.

---

## Sources & Research

- No new external research was load-bearing — Supabase client-side auth (`signInWithPassword`) follows the same client instance and SDK usage pattern already established in the Live Data Engine plan's Sources & Research.
