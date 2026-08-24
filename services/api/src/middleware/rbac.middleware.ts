import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard.js';
import { sendError } from '../utils/response.js';

type Role = 'tourist' | 'authority' | 'admin';

/**
 * Role-Based Access Control middleware.
 * Restricts route access to specified roles.
 * Admin always has access (superset of authority).
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }

    // Admin has access to everything
    if (req.user.role === 'admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions for this resource');
      return;
    }

    next();
  };
}

/**
 * Ensure authority users can only access their jurisdiction.
 * Checks if the target resource falls within the authority's assigned zone.
 */
export function requireJurisdiction() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }

    // Admin bypasses jurisdiction check
    if (req.user.role === 'admin') {
      next();
      return;
    }

    if (req.user.role === 'authority' && !req.user.jurisdictionId) {
      sendError(res, 403, 'NO_JURISDICTION', 'Authority account has no assigned jurisdiction');
      return;
    }

    next();
  };
}

/**
 * Ensure the authenticated user can only access their own resources.
 * Compares req.user.userId with the :userId param or body.userId.
 */
export function requireOwnership(paramName = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
      return;
    }

    // Admin bypasses ownership check
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const targetUserId = req.params[paramName] || req.body?.[paramName];
    if (targetUserId && targetUserId !== req.user.userId) {
      sendError(res, 403, 'FORBIDDEN', 'You can only access your own resources');
      return;
    }

    next();
  };
}
