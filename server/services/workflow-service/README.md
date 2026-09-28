# Workflow service

Owns the stage catalog and every vacancy application workflow. It consumes `vacancy.vacancy.created.v1` and idempotently creates the default `Submitted → HR screening → Technical interview → Final interview → Offer` pipeline.

Stages sharing the same `position` run in parallel. The reorder endpoint accepts every stage exactly once, grouped by position. System stage types are immutable; users may create, edit and deactivate personal types.

Swagger is available at `http://localhost:3004/docs` outside production.

## HR preparation

On first opening the system `hr_screening` stage, the client calls
`POST /api/v1/workflows/:workflowId/stages/:stageId/preparation` with a bearer token and no body.
The server loads the current user's profile and vacancy through their REST APIs,
generates a tailored CV and cover letter, and stores version 1. Subsequent calls return
the latest saved version without another AI request. Initial concurrent requests may call
AI more than once, but a stage row lock ensures only one version 1 is saved.

The result contains `id`, `stageId`, `version`, `cv`, `coverLetter`, `prompt`,
`target` and `createdAt`. Documents are Markdown strings (PDF/DOCX export is not implemented).
The source is the reviewed profile derived from the uploaded CV; the original uploaded
file and its layout are not stored. The master profile is never overwritten.

- `GET .../preparation`: latest version; returns 404 before initial generation.
- `GET .../preparation/versions`: saved versions, newest first.
- `POST .../preparation/revisions`: create a new version using
  `{"baseVersion":1,"target":"cv","prompt":"Emphasize my backend projects"}`.
  Targets are `cv`, `cover_letter`, and `both`. The unselected document is preserved exactly.

Revisions use the original profile/vacancy snapshot and the current documents so each
version has stable factual sources. Later profile/vacancy edits do not silently change
those sources. Stale or concurrently superseded revisions return 409. Failed generation
does not replace existing documents. Missing profile experience/projects/skills or invalid
AI output returns 422; provider/source unavailability or missing AI configuration returns 503.
Only the owner's system HR stages support generation; other stage types return 400.
The prompt instructs AI to use existing facts only, but users should review generated text.

Set `OPENAI_API_KEY`, `OPENAI_MODEL`, `PROFILE_SERVICE_URL`, and `VACANCY_SERVICE_URL`;
see `.env.example`. Compose supplies internal service URLs and the shared AI settings.
Source API requests forward the user's bearer token; service databases are not shared
at the application layer. Tokens are never saved with preparations.

## Stage notes

All standard and custom stages support multiple notes:

- `GET /api/v1/workflows/:workflowId/stages/:stageId/notes`
- `POST .../notes` with `{"content":"Questions for the interviewer"}`
- `PATCH .../notes/:noteId` with `{"content":"Updated note"}`
- `DELETE .../notes/:noteId`

Notes include creation/update timestamps. A workflow owner can access only notes of
the specified stage. Deleting a stage cascades to its notes and preparation versions.
The existing single `note` field on a stage remains available for compatibility; it is
independent of the new notes collection and is not sent to AI.

Schema synchronization creates the tables during development. System stage types are
seeded at startup using insert-on-conflict-do-nothing, preserving existing catalog IDs.
Workflow tables use PostgreSQL's default `public` schema. Standard TypeORM
`synchronize: true` creates them during development without a custom data-source factory.
Before upgrading an existing database that has tables in `workflow`, stop the service
and move its tables and their enum types to `public` using `ALTER TABLE/TYPE ... SET SCHEMA public`
in one transaction. Check for conflicting names first. Synchronization does not move
existing tables or data between schemas.
Category and status columns use explicit enum names (`stage_category_enum` and
`stage_status_enum`) to preserve compatibility with the existing shared types.

## Tests

`npm test` runs unit tests. To include HTTP/PostgreSQL integration tests, point
`WORKFLOW_TEST_DATABASE_URL` at a dedicated database named `offerly_workflow_test`
and run `npm test`. These tests create workflow tables in `public` and the catalog, use mocked
AI/source responses, and clean up their own workflows. Never point this variable
at an application database.
