@AGENTS.md

# Tus-Cup — Sistem Informasi Turnamen

## Project Overview
Tournament Information System built with Next.js 16 (App Router, TypeScript, Tailwind CSS v4).

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Runtime:** Node.js

## Architecture
```
src/
  app/
    (routes)/       # App Router pages
    api/            # API route handlers
  lib/              # Shared utilities and logic
  components/       # Reusable UI components
```

## Compound Engineering Loop
Plan → Work → Review → Compound → Repeat

### docs/ structure
- `docs/plans/`       — Plans created via /workflows:plan
- `docs/brainstorms/` — Brainstorms created via /workflows:brainstorm
- `docs/solutions/`   — Solved problems with YAML frontmatter (searchable)

### todos/ structure
- `todos/` — Work items with priority and status
  - Format: `NNN-{status}-p{priority}-{description}.md`
  - Status: ready | pending | done
  - Priority: p1 (must fix) | p2 (should fix) | p3 (nice to fix)

## Preferences & Patterns

### API Routes
- Use `export async function GET/POST(request: Request)` pattern
- Return `NextResponse.json({ error })` with proper HTTP status on failure
- Validate inputs at the route boundary before processing

### TypeScript
- Prefer `type` over `interface` for data shapes
- Export types alongside their schemas/validators
- Strict mode is enabled — no implicit `any`

### Components
- Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- Keep components small and focused — one responsibility per file

### Styling & Design Tokens
- Brand palette is **red / white / gray only** — no other hues without explicit sign-off
- All colors come from tokens defined in `src/app/globals.css` (`bg-status-live`, `text-text-muted`, `bg-red-strong`, etc.) — never hardcode hex/rgb values in components
- Two red intensities carry distinct meanings, not decoration: `red` (vivid) = "live" status happening now; `red-strong` (deep) = irreversible confirmation actions (Mark Finished, Correct Score). Don't reuse one for the other's purpose.
- Only the "live" match status gets a prominent color; `pending`/`finished`/`corrected` are gray text/icon labels, never colored backgrounds
- Interactive primitives (dialogs, tabs) use Radix UI, styled with Tailwind — don't hand-roll modal/tab behavior
- Reusable UI pieces (status badges, dialogs) live in `src/components/` and must be built before the pages that consume them — check for an existing shared component before adding a new one
- **Spacing:** use Tailwind's default scale directly (`p-2`, `gap-4`, etc.) — don't invent custom spacing values. Card/container padding defaults to `p-4`; tight inline layouts (badges, button groups) use `p-1`–`p-2`
- **Typography:** `text-sm` for body/labels, `text-base` for primary content (scores, match names), `text-lg`+ for page/section headings, `text-xs` for status badges and metadata. Font weight: `font-semibold` for headings and live-status emphasis, `font-normal` elsewhere
- **Elevation:** Tailwind's default shadow scale, not custom values — `shadow-sm` for resting cards, `shadow-lg` for Radix Dialog/Popover content, no shadow on inline elements (badges, buttons)
- **Icons:** `lucide-react` only — don't hand-draw SVGs or mix in another icon set. Default size `size-4` inline with text, `size-5` for standalone/button icons
- **Responsive:** the public live-view pages (Public Transparency Layer) are viewed on phones during live events — mobile-first, verify at `sm` breakpoint before assuming desktop layout. The panitia dashboard can assume desktop/tablet primarily

### Error Handling
- Log full errors server-side, never expose stack traces to client
- Use typed error returns rather than throwing where possible

## When Something Goes Wrong
<!-- Add notes here so the agent learns from mistakes -->

