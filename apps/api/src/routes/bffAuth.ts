import type { Request, Response } from 'express';

import type { ApiConfig } from '../config/env';

const COOKIE_NAME = 'bff_access_token';

export async function exchangeBffCode(
  request: Request,
  response: Response,
  config: ApiConfig,
) {
  const issuer = config.oauth2.issuerBaseUrl;
  if (!issuer) {
    response.status(503).json({
      message: 'OAuth2 authentication is not configured.',
      status: 'auth_not_configured',
    });
    return;
  }

  const {
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  } = request.body as Record<string, unknown>;
  if (
    typeof code !== 'string' ||
    typeof codeVerifier !== 'string' ||
    typeof redirectUri !== 'string'
  ) {
    response.status(400).json({
      message: 'code, code_verifier, and redirect_uri are required.',
      status: 'invalid_request',
    });
    return;
  }

  const tokenResponse = await fetch(`${issuer}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.oauthClientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });
  const token = (await tokenResponse.json()) as Record<string, unknown>;
  if (!tokenResponse.ok || typeof token.access_token !== 'string') {
    response.status(tokenResponse.status).json(token);
    return;
  }

  response.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token.access_token)}; HttpOnly; Path=/; SameSite=Lax${config.environment === 'production' ? '; Secure' : ''}`,
  );
  response.json({
    expires_in: token.expires_in,
    scope: token.scope,
    token_type: token.token_type,
  });
}

export function clearBffSession(
  _request: Request,
  response: Response,
  config: ApiConfig,
) {
  response.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax${config.environment === 'production' ? '; Secure' : ''}`,
  );
  response.status(204).end();
}
