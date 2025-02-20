import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

const rateLimits = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const rateLimit = (req: Request, res: Response, _next: NextFunction) => {
  const ip = req.ip;
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit) {
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return _next();
  }

  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + WINDOW_MS;
    return _next();
  }

  if (limit.count >= MAX_REQUESTS) {
    throw new AppError('Too many requests', 429);
  }

  limit.count++;
  rateLimits.set(ip, limit);
  _next();
};
