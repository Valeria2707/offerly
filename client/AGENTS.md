<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend rules

## Structure

- `app/` — routing only. Pages compose components and own page-level state; no business logic.
- `app/(auth)/` — public auth screens. `app/(app)/` — everything behind the login guard.
- `components/ui/` — shadcn primitives. Never edit them for one feature; override via `className` at the call site.
- `components/core/` — shared form atoms (`TextField`, `TextareaField`, `TagListField`, `FieldLabel`, `AddRow`, `RemoveRowButton`). Check here before writing a new field component.
- `components/<domain>/` — feature components, for example `vacancies/`, `profile/`.
- `api/` — one file per backend service, request functions only.
- `hooks/` — React Query wrappers over `api/`.
- `types/` — mirrors of backend DTOs, one file per domain.
- `constants/` — routes, API paths, enum labels, static copy.
- `schemas/` — zod schemas for forms, one file per domain.
- `stores/` — zustand stores; session state only.
- `lib/` — pure functions, no React.

## Backend contract

- Types in `types/` mirror the service DTO exactly. Never invent a field the backend does not return, never drop one it does.
- Before building a screen, read the service controller, DTOs and entities and confirm the field list.
- Derived UI values (badges, duplicate hints, counters) are computed in `lib/`, not added to the mirrored type.
- Services run `forbidNonWhitelisted: true` — an unknown key returns 400. Send exactly the DTO shape.
- Empty form strings must become `null` before a request; optional URL fields reject `""`.
- Each service has its own base URL. Pass `baseUrl` to `apiRequest`; add the variable to `.env.example` and to the frontend build args in `docker-compose.yml`.

## Data layer

- Server state lives in React Query, session state in zustand. Never duplicate server data into the store.
- `apiRequest` is the only place that talks to the network.
- Query keys live next to their hooks as a `*Keys` object.
- 401 handling is centralised in `query-client.ts`; individual hooks must not repeat it.
- State that must outlive a conditional render belongs in the page, not in the component that unmounts.

## Styling

- Colours come from CSS variables only. No hex values in components.
- Palette tokens: `background`, `card`, `muted`, `secondary`, `primary`, `terracotta`, `ai`, `success`, `warning`, `destructive`, `subtle`.
- Field styling comes from `FIELD_CLASS`. A class that must override it is passed to `cn()` **after** it — tailwind-merge keeps the last conflicting class.
- Dark mode is not supported. The `dark:` variant stays class-based so the system theme cannot switch it on.

## Components

- One component per file, named export; default exports only in `app/`.
- Props typed inline unless reused; no `React.FC`.
- Prefer `useSyncExternalStore` over `useEffect` + `setState` for reading external state.
- Loading states use skeletons that match the final layout — never a bare spinner where content will appear.
- Form-level errors render inside the form; action errors render as a toast. A block inside a centred dialog changes its height and makes it jump.

## Accessibility

- Every input has a `<label>` bound by `htmlFor`/`id`.
- Icon-only buttons have `aria-label`.
- Sequences of steps use `<ol>`; tabular data uses `<table>`.
- Body text on the cream background uses `muted-foreground`; `subtle` is for captions only.

## Before finishing

- `npx tsc --noEmit` must pass.
- No unused imports and no duplicate components left behind.
- New environment variables documented in `.env.example`.
