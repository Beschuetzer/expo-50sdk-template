import type { Request, Response } from 'express';

export function meRoute(request: Request, response: Response) {
  response.json({
    subject: request.auth?.payload.sub ?? null,
    claims: request.auth?.payload ?? {},
  });
}