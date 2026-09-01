# Microservices platform

The initial stack contains Kafka and an authentication service with login, logout, JWT validation, health checks, and Swagger.

## Run

```bash
cp .env.example .env
# Change JWT_SECRET and credentials in .env
docker compose up --build
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- Kafka from the host: `localhost:9094`

Default development credentials are `admin` / `admin123`. They are only a convenience fallback; set your own values in `.env`.

## Authentication flow

1. `POST /api/v1/auth/login` returns a short-lived access token.
2. Send it as `Authorization: Bearer <token>` to `GET /api/v1/auth/me` and `POST /api/v1/auth/logout`.
3. Logout revokes that token in this service instance until expiration. Because the revocation list is in memory, use Redis or another shared store before running multiple auth replicas.

The service publishes non-sensitive audit events to `identity.auth.login.v1` and `identity.auth.logout.v1`.
