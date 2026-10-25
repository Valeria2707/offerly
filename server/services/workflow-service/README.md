# Workflow service

Owns the stage catalog and every vacancy application workflow. It consumes `vacancy.vacancy.created.v1` and idempotently creates the default `Submitted → HR screening → Technical interview → Final interview → Offer` pipeline.

Stages sharing the same `position` run in parallel. The reorder endpoint accepts every stage exactly once, grouped by position. System stage types are immutable; users may create, edit and deactivate personal types.

Each stage of a vacancy workflow has its own list of notes (`stage_notes`), managed via `POST|PATCH|DELETE /workflows/:workflowId/stages/:stageId/notes[/:noteId]` and returned inside every stage of the workflow response.

Stage statuses: `not_started`, `scheduled`, `in_progress`, `awaiting_result`, `completed`, `cancelled` (the candidate did not pass — the whole vacancy is rejected and other statuses freeze), `skipped`, and `cancelled_by_company` (the company called the stage off; the process goes on). A `cancelled` stage may carry a `rejectionReason` from a fixed classifier (`skills`, `experience`, `salary`, `language`, `location`, `culture_fit`, `test_task`, `position_closed`, `other_candidate`, `candidate_declined`, `no_reason`, `other`); any other status clears it.

`GET /workflows/summary?vacancyIds=` returns, per vacancy, the first unfinished stage (`currentStage`) and the furthest reached one (`reachedStage`: any status except `not_started` and `skipped`, so a rejection counts). Each brief carries the catalog `code` and `completedAt`; the frontend board places vacancies into columns by `reachedStage`.

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

## Calendar and reminders

`CalendarModule` exposes every stage that carries a date, the reminders derived from those dates, and a personal iCalendar subscription. Prefix: `/api/v1/calendar`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | JWT | Stages whose `scheduledAt` or `deadlineAt` falls inside `from`/`to` |
| `GET` | `/reminders` | JWT | What needs attention now, filtered by the user's active rules |
| `GET` | `/settings` | JWT | Reminder rules, quiet hours, notification email, subscription token |
| `PATCH` | `/settings` | JWT | Change any of the above |
| `POST` | `/subscription` | JWT | Issue the subscription token once; repeated calls return the same one |
| `GET` | `/subscription.ics?token=` | none | iCalendar feed for calendar clients, which cannot send a bearer token |

Reminders are derived, never stored. `utils/reminders.utils.ts` is a pure function over open stages and is shared by the HTTP endpoint and the mailer, so the UI and the emails can never disagree:

| Kind | Condition |
| --- | --- |
| `record_result` | `scheduledAt` is in the past while the stage is still scheduled or in progress |
| `interview_today` | `scheduledAt` is today |
| `deadline_soon` | `deadlineAt` is within two days |
| `silence` | the stage awaits a result and has not changed for ten days |

Email is not sent from this service. When a reminder comes due the worker writes a `workflow.reminder.due.v1` event to `outbox_events` in the same transaction as the `sent_reminders` row, so a crash can neither lose nor duplicate a message. `OutboxPublisherService` ships it to Kafka, and auth-service delivers it: only auth-service knows the user's email address, so the address never leaves the service that owns it.

The worker wakes every fifteen minutes using `setInterval`, the same pattern as the vacancy outbox publisher, and queues two kinds of message: a reminder the day before an interview and a Monday digest. Quiet hours suppress queueing entirely. `reminder_settings.email_enabled` is the user's opt-in; the address itself is not stored here.

## Analytics

`AnalyticsModule` exposes `GET /api/v1/analytics?period=7|30|90` (JWT). Omit `period` for the whole history. The response is computed on every request and nothing is stored.

Workflows and stages are read from this service's own tables. The vacancy list and the profile are fetched from vacancy-service and profile-service through their authenticated REST APIs with the caller's bearer token, the same way preparation does. A failed upstream call returns 503; an expired token returns 401.

All calculations live in `utils/analytics.utils.ts` as pure functions:

| Block | Rule |
| --- | --- |
| Summary | Vacancies added in the period, the previous period of the same length, active and awaiting processes, offers per added vacancy, average days from adding to an offer or rejection |
| Funnel | Added → reached a screening stage → reached a technical stage → reached a behavioral (final) stage → offer completed. "Reached" means any status except `not_started` and `skipped` |
| Outcomes | Offer completed; rejected or archived; a stage awaits a result; everything else is in progress |
| Weekly | Monday-based UTC weeks (4–13 for a period, 12 for the whole history): vacancies added and stages completed |
| Categories | Completed versus cancelled stages for each category |
| Skills | Top required skills of the period, case-insensitive, marked when present in the profile |
| Work format | Vacancies grouped by `workFormat`; unknown is `null` |

The `submitted` stage is completed automatically when a workflow is created, so it is excluded from weekly activity and category results.
