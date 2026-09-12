import express, { type ErrorRequestHandler, type Express } from 'express';

import { createOAuth2Middleware, type AuthMiddleware } from './auth/middleware';
import { loadConfig, type ApiConfig } from './config/env';
import { clearBffSession, exchangeBffCode } from './routes/bffAuth';
import { createHealthRoute, type DatabaseHealth } from './routes/health';
import { meRoute } from './routes/me';

export type CreateAppOptions = {
  authMiddleware?: AuthMiddleware;
  databaseHealth?: DatabaseHealth;
};

export function createApp(
  config: ApiConfig = loadConfig(),
  options: CreateAppOptions = {},
): Express {
  const app = express();
  const authMiddleware =
    options.authMiddleware ?? createOAuth2Middleware(config);

  app.disable('x-powered-by');
  app.use((request, response, next) => {
    const origin = request.headers.origin;
    if (origin && origin === config.corsOrigin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.setHeader('Vary', 'Origin');
    }
    if (request.method === 'OPTIONS') {
      response.status(origin === config.corsOrigin ? 204 : 403).end();
      return;
    }
    next();
  });
  app.use(express.json());
  app.get('/health', createHealthRoute(config, options.databaseHealth));
  app.post('/auth/token', (request, response, next) => {
    exchangeBffCode(request, response, config).catch(next);
  });
  app.post('/auth/logout', (request, response) => {
    clearBffSession(request, response, config);
  });
  app.get('/auth/session', authMiddleware, (_request, response) => {
    response.status(204).end();
  });
  app.get('/api/v1/me', authMiddleware, meRoute);

  app.use((_request, response) => {
    response.status(404).json({
      message: 'Try GET /health',
      status: 'not_found',
    });
  });

  const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
  ) => {
    const statusCode =
      typeof error?.statusCode === 'number'
        ? error.statusCode
        : typeof error?.status === 'number'
          ? error.status
          : 500;
    response.status(statusCode).json({
      message:
        statusCode >= 500
          ? 'Internal server error'
          : error.message ?? 'Request failed.',
      status:
        statusCode === 401
          ? 'unauthorized'
          : statusCode === 403
            ? 'forbidden'
            : statusCode >= 500
              ? 'internal_error'
              : 'bad_request',
    });
  };
  app.use(errorHandler);

  return app;
}
