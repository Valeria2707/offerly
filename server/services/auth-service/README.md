# Auth service

NestJS microservice responsible for login, logout, and access-token authentication.

Users and revoked access tokens are persisted in PostgreSQL through TypeORM. The database schema is created and kept in sync from the entities with TypeORM `synchronize: true`; there are no migrations.

## Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/health`
- Swagger UI: `/docs`

## Local development

```bash
cp .env.example .env
npm install
npm run start:dev
```

The service creates the initial user from `AUTH_NAME`, `AUTH_EMAIL`, and `AUTH_PASSWORD`. Password-reset messages are sent through SMTP; Docker Compose includes Mailpit for local email testing at `http://localhost:18025`.

Access tokens are short-lived JWTs. Opaque refresh tokens are rotated on every use and stored only as SHA-256 hashes. Configure Google Identity Services with `GOOGLE_CLIENT_ID`; the frontend sends the returned ID token to `POST /auth/google`.

## Reminder notifications

Consumes `workflow.reminder.due.v1`. The event carries the user id and a ready subject and body; this service resolves the address from its own `users` table and sends the message over SMTP, so no other service has to store an email address. Delivery is idempotent: every handled `eventId` is recorded in `sent_notifications` and a repeated event is ignored. An event for an unknown user is logged and skipped.
