# Workflow service

Owns the stage catalog and every vacancy application workflow. It consumes `vacancy.vacancy.created.v1` and idempotently creates the default `Submitted → HR screening → Technical interview → Final interview → Offer` pipeline.

Stages sharing the same `position` run in parallel. The reorder endpoint accepts every stage exactly once, grouped by position. System stage types are immutable; users may create, edit and deactivate personal types.

Swagger is available at `http://localhost:3004/docs` outside production.
