# Engineering rules

## Architecture

- Keep every microservice isolated in `services/<service-name>` with its own `package.json`, Dockerfile, configuration, tests, and README.
- Services own their data and must not access another service's database directly.
- Use REST for synchronous public APIs and Kafka for asynchronous integration events.
- Kafka topic names use `<domain>.<entity>.<event>.v<version>`, for example `identity.auth.login.v1`.
- Event payloads must contain `eventId`, `eventType`, `occurredAt`, `producer`, and `data`. Consumers must be idempotent.
- Never put passwords, JWTs, secrets, or other sensitive values into logs or Kafka events.

## API and Swagger

- Every HTTP endpoint must be documented in Swagger in the same pull request.
- Add `@ApiTags`, operation summary, request/response schemas, relevant status codes, and auth requirements.
- DTOs must use `class-validator` and `@ApiProperty`; never accept untyped request bodies.
- When an endpoint changes incompatibly, introduce a new API version instead of silently breaking clients.
- Keep `/docs` enabled outside production. If production documentation is enabled, protect it appropriately.

## Code style

- Use TypeScript strict mode; do not use `any` unless the reason is documented locally.
- Prefer small, single-purpose modules and dependency injection. Controllers handle transport only; business rules belong in services.
- Use descriptive English names. Files use `kebab-case`; classes use `PascalCase`; variables and functions use `camelCase`.
- Validate environment variables at startup and fail fast with a useful message.
- Return consistent errors through framework exceptions; do not leak stack traces or internal details.
- Use structured logs with a correlation/request ID where possible.
- Use async/await and handle every promise. Set timeouts and retries for network calls where appropriate.
- Keep secrets in environment variables or a secret manager, never in source control.

## Quality gates

- Add unit tests for business logic and integration/e2e tests for endpoints and Kafka contracts.
- Cover success, validation, authentication/authorization, and failure paths.
- Before merging, run formatting, linting, tests, and a production build.
- Update the service README and `.env.example` when behavior or configuration changes.

## Authentication

- Passwords must be hashed with a modern password hashing function and must never be stored or logged in plain text.
- JWTs must have a short explicit lifetime, issuer, audience, subject, and unique `jti` claim.
- Protected endpoints must use a shared authentication guard; do not parse JWTs manually in controllers.
- This MVP has no refresh tokens. Logout revokes the current access token until it expires. A distributed store is required before scaling the auth service to multiple replicas.
