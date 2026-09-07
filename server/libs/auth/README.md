# @offerly/auth

Shared JWT verification package for backend resource services.

It exports `SharedAuthModule`, `JwtAuthGuard`, `AuthenticatedRequest` and `JwtPayload`. It validates bearer access tokens locally using the common secret, issuer `auth-service` and audience `microservices-api`; it does not call auth-service or Kafka per request.

Build it before installing a consumer after changing the library:

```bash
npm install
npm run build
```

Docker builds compile and package the library automatically.
