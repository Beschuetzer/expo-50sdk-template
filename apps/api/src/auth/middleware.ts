import type { RequestHandler } from 'express';
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';

import type { ApiConfig } from '../config/env';

export type AuthMiddleware = RequestHandler;

export function createOAuth2Middleware(config: ApiConfig): AuthMiddleware {
  const { audience, issuerBaseUrl } = config.oauth2;

  if (!issuerBaseUrl || !audience) {
    return (_request, response) => {
      response.status(503).json({
        message:
          'OAuth2 authentication is not configured. Set AUTH_ISSUER_BASE_URL and AUTH_AUDIENCE.',
        status: 'auth_not_configured',
      });
    };
  }

  const verifier = auth({ issuerBaseURL: issuerBaseUrl, audience });
  const scopeMiddleware = config.oauth2.requiredScopes.length
    ? requiredScopes(config.oauth2.requiredScopes)
    : undefined;

  return (request, response, next) => {
    verifier(request, response, (error) => {
      if (error) {
        next(error);
        return;
      }

      if (scopeMiddleware) {
        scopeMiddleware(request, response, next);
        return;
      }

      next();
    });
  };
}
