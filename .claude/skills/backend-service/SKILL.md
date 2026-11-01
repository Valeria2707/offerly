---
name: backend-service
description: Use when writing or changing code in server/ (NestJS microservices auth, profile, vacancy and workflow; TypeORM on Postgres; Kafka with an outbox; OpenAI calls). Service rules, AI-call pattern, testing and rebuild steps.
---

# Backend service conventions (server/)

`server/AGENTS.md` and `server/HELPERS.md` are the source of truth — read them first. This skill adds the rules learned while building the project.

## Keep it simple

- Change only what the task needs. No new libraries, shared Nest modules or extra layers unless the user asks.
- Prefer a small pure function plus a test over a new service.
- Run Prettier only on the files you changed. Running it on `src/` reformats unrelated files.

## Architecture

- Every service owns its own Postgres schema (`vacancy`, `profile`, `workflow`). Never read another service's tables; talk over REST or Kafka.
- TypeORM runs with `synchronize: true`: a new column appears after a restart. Make new columns nullable so existing rows stay valid.
- Controllers only handle transport; logic goes into services or pure functions.
- Every endpoint has DTOs with `class-validator` and `@ApiProperty`, plus Swagger responses. The global pipe uses `forbidNonWhitelisted: true`.

## AI calls

- Before sending text to OpenAI, remove personal data with `anonymize()` from `@offerly/helpers`; do not send the profile full name.
- Use the Responses API with a strict `json_schema` and `store: false`, then validate the result with `class-validator`.
- Wrap every AI call in `AiLogService.track(userId, operation, run)` so it appears in the `ai_operations` log.
- Errors: 503 when the provider is unavailable or not configured, 422 when it returns invalid content. No automatic retries.

## Shared helpers

- `libs/helpers` holds only pure, domain-independent functions. Export them from `src/index.ts` and document them in its README.
- After changing helpers, build them (`npm run build` in `libs/helpers`) before running a service locally.

## Tests and checks

Run inside the service folder:

```bash
npx tsc --noEmit -p tsconfig.json
npx jest --runInBand
npx eslint <changed files>
npx prettier --write <changed files>
```

- Add tests for new logic (pure functions, services with mocked repositories) and for new endpoints (HTTP tests like `test/preparation-api.spec.ts`).
- `workflow-service/test/preparation-entity.spec.ts` already fails before any change — mention it, do not "fix" it as part of an unrelated task.

## After the change

Tell the user to rebuild the changed service, otherwise the old container keeps running:

```bash
docker compose up -d --build <service>
```
