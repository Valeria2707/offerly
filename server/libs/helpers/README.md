# `@offerly/helpers`

Shared, framework-independent backend helpers. Import from `@offerly/helpers`; do not copy these implementations into a service.

## Available helpers

- `isRecord(value)` — narrows an unknown value to an object record.
- `getValidationPaths(errors)` — flattens nested validation errors to dotted property paths.
- `calculateSha256(value)` — returns a SHA-256 hex digest for a string or buffer.
- `getErrorCode(error, maxLength?)` — derives a safe, bounded error class name.
- `normalizeUrl(url)` — trims a URL and adds `https://` when the scheme is absent.
- `isOpenAiResponse(value)` — validates the common OpenAI Responses API output envelope.
- `anonymize(text)` — replaces e-mails and phone numbers with `[email]` and `[phone]` before text is sent to an AI provider; also returns the removed values.

- `isUniqueViolation(error)` — true for a Postgres unique constraint violation (`23505`).
- `escapeHtml(text)` — escapes user text before it goes into an HTML email.
- `KAFKA_TOPICS`, `createIntegrationEvent(topic, producer, data)` — topics shared between services and the common event envelope (`eventId`, `eventType`, `occurredAt`, `producer`, `data`).
- `API_PREFIX`, `MINUTE_MS`, `DAY_MS`, `OPENAI_RESPONSES_URL`, `OPENAI_TIMEOUT_MS` — shared constants.

## Rules for adding helpers

1. Search this package before implementing a new utility in a service.
2. Add only pure, domain-independent functions used by multiple services or clearly reusable across them.
3. Keep domain rules in their owning service. PDF/CV parsing, vacancy mapping, SSRF protection and workflow ordering are not shared helpers.
4. Export every public helper from `src/index.ts` and document it here.
5. Do not make this package depend on NestJS, TypeORM or a service package.
