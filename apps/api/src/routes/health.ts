import type { HealthResponse } from '@expo-50sdk-template/shared-types';
import type { Request, Response } from 'express';

import type { ApiConfig } from '../config/env';
import { prisma } from '../lib/prisma';
import { logError } from '../logging';

export type DatabaseHealth = {
  $runCommandRaw(command: { ping: number }): Promise<unknown>;
};

export function createHealthRoute(
  config: ApiConfig,
  database: DatabaseHealth = prisma,
) {
  return async function healthRoute(_request: Request, response: Response) {
    if (!config.databaseUrl) {
      const healthResponse: HealthResponse = {
        service: 'api',
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      response.status(200).json(healthResponse);
      return;
    }

    try {
      await database.$runCommandRaw({ ping: 1 });
      const healthResponse: HealthResponse = {
        service: 'api',
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      response.status(200).json(healthResponse);
    } catch (error) {
      logError('database_health_check_failed', {
        error: error instanceof Error ? error.stack : String(error),
      });
      response.status(503).json({
        service: 'api',
        status: 'degraded',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
