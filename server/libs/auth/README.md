# @offerly/auth

Shared JWT verification package for backend resource services.

It exports `SharedAuthModule`, `JwtAuthGuard`, `AuthenticatedRequest` and `JwtPayload`. It validates bearer access tokens locally using the common secret, issuer `auth-service` and audience `microservices-api`; it does not call auth-service or Kafka per request.

Because of that, resource services do not see revoked tokens: after logout an access token keeps working there until it expires (`JWT_EXPIRES_IN`, 15 minutes by default). auth-service itself checks revocation. `JWT_ISSUER` and `JWT_AUDIENCE` are exported so the signer and the verifiers use the same values.

Build it before installing a consumer after changing the library:

```bash
npm install
npm run build
```

Docker builds compile and package the library automatically.
