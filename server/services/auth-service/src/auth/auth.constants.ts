export const AUDIT_TOPICS = {
  LOGIN: 'identity.auth.login.v1',
  REGISTERED: 'identity.user.registered.v1',
  GOOGLE_LOGIN: 'identity.auth.google-login.v1',
  LOGOUT: 'identity.auth.logout.v1'
} as const;

export const PASSWORD_HASH_ROUNDS = 12;
export const PASSWORD_RESET_TTL_MINUTES = 30;
export const PASSWORD_RESET_TOKEN_BYTES = 32;
export const REFRESH_TOKEN_BYTES = 64;
