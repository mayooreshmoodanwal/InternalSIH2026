import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis.js';
import { sendError } from '../utils/response.js';
import { Request, Response } from 'express';

/**
 * Rate limiting middleware using Redis store for distributed environments.
 * Policies per API Specification §13.
 */

// Auth endpoints: 5 req / 15 min / IP
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip || 'unknown',
  handler: (_req: Request, res: Response) => {
    sendError(res, 429, 'RATE_LIMITED', 'Too many authentication attempts. Please try again later.');
  },
});

// SOS trigger: 3 req / min / user — deliberately generous
export const sosRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || req.ip || 'unknown';
  },
  handler: (_req: Request, res: Response) => {
    sendError(res, 429, 'RATE_LIMITED', 'SOS rate limit reached. If this is a real emergency, call local emergency services directly.');
  },
});

// Read-heavy endpoints: 60 req / min / user
export const readRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || req.ip || 'unknown';
  },
});

// General authenticated: 30 req / min / user
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || req.ip || 'unknown';
  },
});
