---
name: frontend-conventions
description: Use when writing or changing code in client/ (Next.js 16 App Router, React 19, TanStack Query v5, zustand, next-intl, shadcn on Base UI, Tailwind v4, sonner). Project rules, data-layer patterns and what to avoid.
---

# Frontend conventions (client/)

`client/AGENTS.md` is the source of truth — read it first. This skill adds the rules learned while building the project.

## Keep it simple

- Change only what the task needs. No new libraries, generic factories, extra layers or "architecture for growth".
- Run Prettier only on the files you changed, never on a whole folder.
- No nested ternaries: use an early return or a small function.

## Where code goes

- `app/` pages only assemble blocks and own page-level state.
- Business logic (counting, filtering, formatting, duplicate detection) lives in `lib/` as pure functions; pass `t` and `locale` as arguments so it can be tested.
- React Query wrappers live in `hooks/`, request functions in `api/`.
- Reuse what exists before adding: `useErrorMessage`, `useStageName`, `lib/calendar` date helpers, `components/core/*` fields.

## TanStack Query

- Query keys are `*Keys` objects next to their hooks. Invalidate through those keys, never through string literals.
- Avoid prefix collisions: if `list` is `["vacancies"]`, invalidating it also refetches every detail. Give the list its own key.
- When the server returns the updated entity, prefer `setQueryData` over a refetch.
- A stage change affects workflow, summaries, calendar and analytics — invalidate all of them through one shared helper.

## Mutations and UX

- Action errors go to a toast via `useErrorMessage`; form errors render inside the form.
- Close a dialog only in `onSuccess`, so a 400 does not wipe what the user typed.
- Keep the pending state until navigation finishes: `isPending || isSuccess` before `router.push`, otherwise the old page flashes.
- Disable buttons and inputs while a mutation runs.

## React

- Compute derived values during render; no `useEffect` + `setState` for them.
- A stable "now": `const [now] = useState(() => new Date())`.
- Memoise only when it is measurably needed.

## i18n

- Every user-facing string goes to both `messages/uk.json` and `messages/en.json` under the same key, including placeholders and aria-labels.
- Use ICU plurals. Dates go through `Intl` or `dateFnsLocale(locale)`.
- Wording for users is plain: no method names or math terms (say "the system", not "the analytic hierarchy process"; no "CR" on screen).

## Types

- `types/` mirrors backend DTOs exactly. Unions come from `as const` arrays.
- No `any`; avoid `as` — narrow with a type guard instead.

## Before finishing

Run on the changed files:

```bash
npx tsc --noEmit -p .
npx eslint <changed files>
npx prettier --check <changed files>
```

If the backend contract changed, remind the user to rebuild the service: `docker compose up -d --build <service>`.
