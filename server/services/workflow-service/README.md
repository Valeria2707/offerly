# Workflow service

Owns the stage catalog and every vacancy application workflow. It consumes `vacancy.vacancy.created.v1` and idempotently creates the default `Submitted → HR screening → Technical interview → Final interview → Offer` pipeline.

Stages sharing the same `position` run in parallel. The reorder endpoint accepts every stage exactly once, grouped by position. System stage types are immutable; users may create, edit and deactivate personal types.

Each stage of a vacancy workflow has its own list of notes (`stage_notes`), managed via `POST|PATCH|DELETE /workflows/:workflowId/stages/:stageId/notes[/:noteId]` and returned inside every stage of the workflow response.

Swagger is available at `http://localhost:3004/docs` outside production.

## Stage preparation

Every stage supports preparation, including completed stages and catalog entries whose `requiresPreparation` flag is false. That catalog flag is advisory, not an access restriction. Preparation is handled by `PreparationModule` in this service; vacancy and profile data are fetched through their authenticated REST APIs using the caller's bearer token. No other service's database is accessed.

Configure `OPENAI_API_KEY` and `OPENAI_MODEL` together to enable generation. Leave both empty to disable generation while retaining access to saved materials and answers. Partial AI configuration and invalid context service URLs fail at startup. Set `VACANCY_SERVICE_URL` and `PROFILE_SERVICE_URL` to the service origins (without `/api/v1`); Docker Compose supplies container addresses. Context requests have a 10-second timeout; generation has a 60-second timeout. AI requests use structured output and `store: false`; the returned content is validated before persistence. Provider errors return safe 503/422 responses and do not create partial records. No automatic AI retries are performed to avoid duplicate paid requests.

Strategy selection uses the catalog code/category, never the stage position:

| Stage | Preparation type | Content |
| --- | --- | --- |
| `submitted` | `CV_COVER_LETTER` | CV tips, cover letter draft, tailored keywords |
| HR/screening and behavioral stages | `HR_SCREENING` | Elevator pitch, experience/behavioral questions, questions for the interviewer |
| `pre_tech_screening` and technical stages | `TECHNICAL` | Target stack, theoretical questions with expected answers, coding exercises |
| Other system stages (offer, negotiation, rejection) | `CUSTOM` | Advice/questions based on the stage name and optional instructions |
| Personal stage types | `CUSTOM` by default | Required user description; optional explicit format override |

Personal stages require nonblank `instructions` (maximum 5,000 characters), even if a different preparation format is selected. This lets a custom technical or HR stage use the corresponding strategy with additional context. System stages accept optional instructions but reject explicit type overrides.

### API

All routes require JWT authentication and ownership of both the workflow and its stage. Prefix: `/api/v1/workflows/:workflowId/stages/:stageId/preparation`.

| Method | Suffix | Purpose |
| --- | --- | --- |
| `POST` | none | Generate once; body `{}` for system stages, or `{ "instructions": "Portfolio review with a designer", "type": "CUSTOM" }` for personal stages |
| `GET` | none | Read saved materials including user answers; 404 if not generated |
| `PATCH` | `/questions/:questionId` | Save `{ "userAnswer": "My answer" }`; empty string clears it, maximum 10,000 characters |
| `DELETE` | none | Explicitly delete materials and all answers (204); generation can then be requested again |

A response contains `id`, `stageId`, `data`, `instructions`, `createdAt`, and `updatedAt`. `data` is a discriminated union: `{ "type": "HR_SCREENING", "content": { "elevatorPitch": "...", "commonQuestions": [{ "id": "uuid", "question": "...", "tips": "...", "expectedAnswer": "...", "userAnswer": "..." }], "questionsToAskInterviewer": [] } }`. Question IDs are assigned by the server; `userAnswer` exists only after the user writes one. All four exact content schemas are documented in Swagger. CV preparation has no answerable questions.

`workflow.stage_preparations` stores one record per stage, enforced by a unique UUID foreign key with `ON DELETE CASCADE`. The complete discriminated union is stored together in a JSONB `data` column to preserve the type/content relationship; original user instructions are stored separately. As with the existing workflow tables, the current TypeORM `synchronize: true` configuration creates the table on service startup. There is no separate migration runner in this service. The stage-note entity is also explicitly registered in the root data source so all workflow relations resolve.

Repeated generation returns 409 instead of replacing saved work. Generation runs outside a database transaction; writes lock the stage and recheck existence, preventing concurrent results from overwriting one another. Answer updates lock the same stage to avoid losing simultaneous edits to different questions. Deleting a workflow or stage cascades to its preparation. Delete/regenerate intentionally discards existing answers; clients should make that clear to users.

### Verification

Build the shared `@offerly/auth` and `@offerly/helpers` packages before installing/building this service, as the Dockerfile does. Run `npm run lint`, `npm test`, and `npm run build`. The test suite covers strategy selection, nested output validation, provider/context failures, ownership, concurrent generation conflicts, answer updates, TypeORM relation metadata, and HTTP endpoints with the real JWT guard. HTTP tests open an ephemeral loopback port. AI, repositories and upstream services are mocked; live PostgreSQL cascade/locking behavior and live AI output require an environment integration check.
