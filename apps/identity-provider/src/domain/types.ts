export type ClientType = 'public' | 'confidential';

export type OAuthClient = {
  clientId: string;
  clientSecret?: string;
  clientType: ClientType;
  redirectUris: string[];
  allowedScopes: string[];
  allowedGrantTypes: Array<'authorization_code' | 'client_credentials'>;
};

export type User = {
  id: string;
  username: string;
  password: string;
  claims?: Record<string, string | number | boolean>;
};

export type AuthorizationCode = {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  expiresAt: number;
};

export interface ClientStore {
  findById(clientId: string): OAuthClient | undefined;
}

export interface UserStore {
  authenticate(username: string, password: string): User | undefined;
  findById(userId: string): User | undefined;
}

export interface AuthorizationCodeStore {
  save(code: AuthorizationCode): void;
  consume(code: string): AuthorizationCode | undefined;
}
