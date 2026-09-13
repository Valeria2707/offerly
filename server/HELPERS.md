# Backend helper policy

Before writing a utility or helper, inspect `libs/helpers` and its README. Reuse `@offerly/helpers` whenever a matching function exists.

Create a service-local helper only when it implements domain-specific behavior. Move it to `libs/helpers` only when it is pure, domain-independent and useful to more than one backend service. Do not duplicate shared helper implementations to avoid adding a package dependency.

When adding a shared helper, export it from `libs/helpers/src/index.ts`, document it in `libs/helpers/README.md`, and verify every consuming service with lint, tests and a production build.
