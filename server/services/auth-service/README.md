# Auth service

NestJS microservice responsible for login, logout, and access-token authentication.

Users and revoked access tokens are persisted in PostgreSQL through TypeORM. Database schema changes are applied with TypeORM migrations; schema synchronization is disabled.

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
