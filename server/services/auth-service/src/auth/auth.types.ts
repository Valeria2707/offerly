export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp?: number;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}
