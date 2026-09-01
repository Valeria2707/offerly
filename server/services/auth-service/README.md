# Auth service

NestJS microservice responsible for login, logout, and access-token authentication.

Users and revoked access tokens are persisted in PostgreSQL through TypeORM. Database schema changes are applied with TypeORM migrations; schema synchronization is disabled.

## Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
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
