export type Profile = {
  id: string;
  name: string;
  email: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};
