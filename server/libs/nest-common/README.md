# `@offerly/nest-common`

Shared NestJS/TypeORM/Kafka code that used to be copied into every service. Pure, framework-independent helpers stay in `@offerly/helpers`.

## Exports

- `AiLogModule`, `AiLogService`, `AiOperation` — the `ai_operations` log. Import `AiLogModule` into the module that calls AI and wrap every call in `aiLog.track(userId, operation, run)`.
- `OutboxModule.register(clientId)`, `OutboxEvent` — publishes rows of `outbox_events` to Kafka (topic = `eventType`). Write the `OutboxEvent` in the same transaction as the business change. A failed send increments `attempts`; after `OUTBOX_MAX_ATTEMPTS` the event is skipped and stays in the table for manual review. Delivery is at-least-once, so consumers must be idempotent.

## Schema

`AiOperation` and `OutboxEvent` do not declare a schema. Each service sets `schema` in its TypeORM options (`profile`, `vacancy`, `workflow`) and lists both entities in `entities`.

## Build

```bash
npm install
npm run build
```

Then run `npm install` in each consuming service: `install-links=true` copies the package into its `node_modules`. Docker builds the library in the `shared-nest-common` stage.
