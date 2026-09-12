import express, { type ErrorRequestHandler, type Express } from 'express';

import { createOAuth2Middleware, type AuthMiddleware } from './auth/middleware';
import { loadConfig, type ApiConfig } from './config/env';
import { healthRoute } from './routes/health';
import { meRoute } from './routes/me';
import { clearBffSession, exchangeBffCode } from './routes/bffAuth';

export type CreateAppOptions = {
  authMiddleware?: AuthMiddleware;
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
  app.get('/health', healthRoute);
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
      typeof error?.statusCode === 'number' ? error.statusCode : 500;
    response.status(statusCode).json({
      message: statusCode === 500 ? 'Internal server error' : error.message,
      status: statusCode === 500 ? 'internal_error' : 'unauthorized',
    });
  };
  app.use(errorHandler);

  return app;
}
