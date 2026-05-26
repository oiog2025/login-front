export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export abstract class AuthInPort {

  abstract login(email: string, password: string): Promise<string | null>;

  abstract loginWithRefreshToken(email: string, password: string): Promise<AuthTokens | null>;

  abstract logout(refreshToken: string): Promise<string | null>;
}
