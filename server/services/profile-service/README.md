# Profile service

Owns the career profile of every user and the temporary CV imports. Data lives in the `profile` schema of the shared Postgres; TypeORM `synchronize: true` creates the tables.

## Endpoints

Prefix `/api/v1`, all routes require a JWT access token (`@offerly/auth`).

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Profile of the current user; an empty one is created on first access |
| `PATCH` | `/profile` | Replace any of the sections (`basics`, `preferences`, `skills`, …); fields that are not sent stay unchanged |
| `POST` | `/profile/cv-imports` | Upload a PDF or DOCX (max 10 MB) and get an AI-extracted draft |
| `GET` | `/profile/cv-imports/:id` | Read a draft |
| `POST` | `/profile/cv-imports/:id/apply` | Apply the reviewed draft to the profile |
| `GET` | `/health` | Liveness check |

Swagger: `http://localhost:3002/docs` outside production.

## CV import

The file signature is checked, the text is extracted (`pdf-parse` / `mammoth`) and anonymized with `anonymize()` from `@offerly/helpers`: e-mails and phones are replaced before the text goes to OpenAI and restored into the draft afterwards. The call uses the Responses API with a strict JSON schema and `store: false`; the result is validated with `class-validator`. Every call is written to `ai_operations` through `AiLogService` from `@offerly/nest-common`.

`OPENAI_API_KEY` and `OPENAI_MODEL` empty → import returns 503. Invalid AI output → 422. No automatic retries.

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

Build `libs/helpers`, `libs/auth` and `libs/nest-common` first (`npm install && npm run build` in each); the Dockerfile does it automatically.
