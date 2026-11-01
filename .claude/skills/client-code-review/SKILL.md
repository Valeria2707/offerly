---
name: client-code-review
description: Use when asked to review code in client/ (Next.js App Router frontend). Read-only review that produces a prioritised findings report with fixes; it never edits files.
---

# Client code review

## Rules

- Read `client/AGENTS.md` first and judge the code against it.
- Read-only: do not edit files, do not run git commands.
- Do not touch `server/`.
- Suggest only what simplifies code or removes duplication: no new libraries, layers, generic factories or "architecture for growth".
- Keep the existing folders: `app/`, `components/`, `hooks/`, `lib/`, `api/`, `types/`, `constants/`, `schemas/`, `stores/`, `i18n/`, `messages/`.
- Never suggest nested ternaries: use an early return or a small function.
- Skip formatting nits that ESLint or Prettier already catch.

## Checklist

1. Duplication: the same logic in several pages or components (error toasts, invalidations, date formatting, mutate with onSuccess/onError) that belongs in `hooks/` or `lib/`.
2. Large pages and components: what to extract so the page only assembles blocks.
3. Business logic inside components that should be a pure function in `lib/` (with `t` and `locale` as arguments).
4. TanStack Query: consistent keys, missing or extra invalidations, `setQueryData` vs invalidate, `staleTime`, sequential requests.
5. Types: `any`, needless `as`, types duplicated between `types/` and `api/`, unions that can come from `as const`.
6. React: needless `useEffect`/`useState`, derived state, keys, memoisation only where it matters.
7. i18n: hard-coded text outside `messages/`, wrong plurals, dates without locale, unused keys, uk/en key mismatch.
8. Accessibility and UX: icon buttons without `aria-label`, missing pending/disabled states, empty and error states, dialogs that lose input on error.
9. Dead code: unused exports, empty files, needless re-exports.
10. Inconsistent names of files, functions and props.

## Output format

1. A findings table sorted by priority (high / medium / low): `file:line`, problem, why it is bad, how to fix.
2. For every high and medium finding, a short "before → after" code example.
3. A "What to extract" section: new hooks and `lib/` functions with name, signature and the places to use them.
4. The 3–5 most useful changes to start with.

Write the report in the user's language.
