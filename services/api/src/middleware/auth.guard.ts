import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';
import { redis } from '../config/redis.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'tourist' | 'authority' | 'admin';
    jurisdictionId?: string;
  };
}

/**
 * JWT authentication guard middleware.
 * Verifies Bearer token, checks session validity, attaches user context.
 */
export async function authGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.slice(7);
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    if (!payload.sub || !payload.role) {
      sendError(res, 401, 'INVALID_TOKEN', 'Token payload is malformed');
      return;
    }

    // Check if session has been revoked (logout-all scenario)
    const sessionRevoked = await redis.get(`revoked:user:${payload.sub}`);
    if (sessionRevoked) {
      const revokedAt = parseInt(sessionRevoked, 10);
      const tokenIssuedAt = (payload.iat || 0) * 1000;
      if (tokenIssuedAt < revokedAt) {
        sendError(res, 401, 'SESSION_REVOKED', 'Session has been revoked');
        return;
      }
    }

    req.user = {
      userId: payload.sub as string,
      role: payload.role as 'tourist' | 'authority' | 'admin',
      jurisdictionId: payload.jurisdictionId as string | undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      sendError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired');
      return;
    }
    sendError(res, 401, 'INVALID_TOKEN', 'Invalid or malformed token');
  }
}

/**
 * Optional auth — attaches user if token present, otherwise continues
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  return authGuard(req, res, next);
}
