# Vacancy service

Owns the user's vacancies: manual edits, AI-assisted import from a job URL or pasted text, recruiter contact, offer details and the offer recommendation (analytic hierarchy process). Data lives in the `vacancy` schema; TypeORM `synchronize: true` creates the tables.

## Endpoints

Prefix `/api/v1`, all routes require a JWT access token (`@offerly/auth`).

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/vacancies` | Vacancies of the current user |
| `GET` / `PATCH` / `DELETE` | `/vacancies/:id` | Read, update or delete one vacancy |
| `POST` | `/vacancies/imports/url` | Load a public job page and create an AI draft |
| `POST` | `/vacancies/imports/text` | Create an AI draft from pasted text (100–100 000 characters) |
| `GET` | `/vacancies/imports/:id` | Read a draft |
| `POST` | `/vacancies/imports/:id/apply` | Create the vacancy from the reviewed draft |
| `POST` | `/vacancies/offers/recommendation` | Rank 2–10 offers by salary, growth and conditions |
| `GET` | `/health` | Liveness check |

Swagger: `http://localhost:3003/docs` outside production.

## Events

Written to `outbox_events` in the same transaction as the change and published by `OutboxModule` from `@offerly/nest-common`:

| Topic | When | Consumer |
| --- | --- | --- |
| `vacancy.vacancy.created.v1` | A draft is applied | workflow-service creates the default workflow |
| `vacancy.vacancy.deleted.v1` | A vacancy is deleted | workflow-service deletes its workflow, stages, notes and preparation |

Payload: `{ eventId, eventType, occurredAt, producer, data: { vacancyId, userId } }`.

## Import

Only public `http(s)` URLs are loaded: private, local and IPv4-mapped private addresses are rejected, redirects are followed manually (max 5) and every hop is checked again. The page is limited to 2 MB. The address is checked before the request, so a DNS answer that changes between the check and the request (DNS rebinding) is not caught.

Text is anonymized with `anonymize()` before it goes to OpenAI (Responses API, strict JSON schema, `store: false`, `max_output_tokens`); the prompt tells the model to treat the page as untrusted data and never follow instructions inside it; the result is validated with `class-validator`. Both `OPENAI_API_KEY` and `OPENAI_MODEL` must be set, or both left empty (import then returns 503).

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Build `libs/helpers`, `libs/auth` and `libs/nest-common` first (`npm install && npm run build` in each); the Dockerfile does it automatically.
