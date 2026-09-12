import type { HealthResponse } from '@expo-50sdk-template/shared-types';
import type { Request, Response } from 'express';

import { prisma } from '../lib/prisma';

export async function healthRoute(_request: Request, response: Response) {
  console.log('Health check requested');

  if (!process.env.DATABASE_URL) {
    const healthResponse: HealthResponse = {
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    response.status(200).json(healthResponse);
    return;
  }

  try {
    await prisma.$runCommandRaw({ ping: 1 });
    const healthResponse: HealthResponse = {
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    response.status(200).json(healthResponse);
  } catch (error) {
    response.status(503).json({
      service: 'api',
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database unavailable',
    });
  }
}
