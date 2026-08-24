import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Audit logging middleware for sensitive actions.
 * Writes to the append-only audit_logs table.
 * 
 * This middleware is applied AFTER the action handler, not before.
 * Call `auditLog()` directly from controllers for fine-grained control.
 */
export async function auditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  justification?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        justification: justification || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
    logger.info(`Audit: ${action} on ${targetType}:${targetId} by ${actorId}`);
  } catch (error) {
    // Audit logging failures must NEVER silently pass
    logger.error('CRITICAL: Audit log write failed', {
      actorId,
      action,
      targetType,
      targetId,
      error,
    });
    // Re-throw to prevent the parent operation from succeeding without audit
    throw error;
  }
}

/**
 * Actions that REQUIRE audit logging.
 * If the audit log write fails, the parent operation MUST also fail.
 */
export const AUDITED_ACTIONS = {
  IDENTITY_REVEAL: 'identity_reveal',
  ZONE_CREATE: 'zone_create',
  ZONE_EDIT: 'zone_edit',
  ZONE_APPROVE: 'zone_approve',
  ALERT_STATUS_CHANGE: 'alert_status_change',
  ALERT_ACKNOWLEDGE: 'alert_acknowledge',
  USER_SUSPEND: 'user_suspend',
  USER_REINSTATE: 'user_reinstate',
  AUTHORITY_APPROVE: 'authority_approve',
  AUTHORITY_REJECT: 'authority_reject',
  PERMIT_APPROVE: 'permit_approve',
  PERMIT_REJECT: 'permit_reject',
  ACCOUNT_DELETE: 'account_delete',
} as const;
