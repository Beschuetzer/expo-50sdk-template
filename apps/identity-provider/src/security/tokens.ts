import { exportJWK, generateKeyPair, SignJWT, type KeyLike } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

import type { IdentityProviderConfig } from '../config/env';
import type { User } from '../domain/types';

export class TokenService {
  private readonly ready: Promise<void>;
  private privateKey!: KeyLike;
  private publicJwk!: Record<string, unknown>;

  constructor(private readonly config: IdentityProviderConfig) {
    this.ready = this.initialize();
  }

  private async initialize() {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    this.privateKey = privateKey;
    this.publicJwk = {
      ...(await exportJWK(publicKey)),
      alg: 'RS256',
      kid: 'local-development-key',
      use: 'sig',
    };
  }

  async getJwks() {
    await this.ready;
    return { keys: [this.publicJwk] };
  }

  async createAccessToken(
    subject: User | { id: string; claims?: Record<string, unknown> },
    clientId: string,
    scope: string,
  ) {
    await this.ready;
    return new SignJWT({
      ...subject.claims,
      scope,
      client_id: clientId,
      token_use: 'access_token',
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'local-development-key' })
      .setIssuer(this.config.issuer)
      .setAudience('api')
      .setSubject(subject.id)
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTokenLifetimeSeconds}s`)
      .sign(this.privateKey);
  }
}

export function createOpaqueValue() {
  return randomBytes(32).toString('base64url');
}

export function createCodeChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}
