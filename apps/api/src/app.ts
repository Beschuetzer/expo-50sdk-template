import express, { type ErrorRequestHandler, type Express } from 'express';

import { createOAuth2Middleware, type AuthMiddleware } from './auth/middleware';
import { loadConfig, type ApiConfig } from './config/env';
import { healthRoute } from './routes/health';
import { meRoute } from './routes/me';

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
  app.use(express.json());
  app.get('/health', healthRoute);
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
