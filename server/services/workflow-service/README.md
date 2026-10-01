# Workflow service

Owns the stage catalog and every vacancy application workflow. It consumes `vacancy.vacancy.created.v1` and idempotently creates the default `Submitted → HR screening → Technical interview → Final interview → Offer` pipeline.

Stages sharing the same `position` run in parallel. The reorder endpoint accepts every stage exactly once, grouped by position. System stage types are immutable; users may create, edit and deactivate personal types.

Each stage of a vacancy workflow has its own list of notes (`stage_notes`), managed via `POST|PATCH|DELETE /workflows/:workflowId/stages/:stageId/notes[/:noteId]` and returned inside every stage of the workflow response.

Swagger is available at `http://localhost:3004/docs` outside production.
