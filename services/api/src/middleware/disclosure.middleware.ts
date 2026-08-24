import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard.js';
import { sendError } from '../utils/response.js';

/**
 * Selective Information Disclosure middleware.
 * Controls what data fields are visible based on the requester's role and context.
 * 
 * This is the CORE privacy mechanism — no role sees more data than their context allows.
 */

export type DisclosureContext =
  | 'self'            // Tourist viewing own data
  | 'no_incident'     // Authority with no active incident
  | 'active_sos'      // Authority responding to active SOS
  | 'post_reveal'     // Authority after identity reveal
  | 'admin_management'// Admin managing users
  | 'admin_audit'     // Admin viewing audit logs
  | 'emergency_contact'; // Emergency contact viewing status

interface FieldProjection {
  include: string[];
  mask?: Record<string, (value: unknown) => unknown>;
}

const DISCLOSURE_RULES: Record<string, Record<string, FieldProjection>> = {
  tourist: {
    self: {
      include: ['*'], // Full access to own data
    },
  },
  authority: {
    no_incident: {
      include: ['id', 'status', 'severity', 'createdAt'],
      mask: {
        userId: (val) => maskId(val as string),
      },
    },
    active_sos: {
      include: ['id', 'userId', 'tripId', 'latitude', 'longitude', 'accuracy', 'batteryLevel', 'severity', 'status', 'triggerType', 'createdAt'],
      mask: {
        userId: (val) => maskId(val as string),
      },
    },
    post_reveal: {
      include: ['id', 'userId', 'tripId', 'latitude', 'longitude', 'accuracy', 'batteryLevel', 'severity', 'status', 'triggerType', 'createdAt', 'userName', 'userPhone', 'documentVerified', 'emergencyContacts'],
      // No masking — identity is revealed (but time-scoped)
    },
  },
  admin: {
    admin_management: {
      include: ['id', 'email', 'phone', 'role', 'status', 'createdAt', 'updatedAt'],
      // No location data, no identity documents
    },
    admin_audit: {
      include: ['id', 'actorId', 'action', 'targetType', 'targetId', 'justification', 'createdAt'],
    },
  },
};

/**
 * Apply selective disclosure to a data object.
 * Strips fields not in the allowed list and applies masking functions.
 */
export function applyDisclosure<T extends Record<string, unknown>>(
  data: T,
  role: string,
  context: DisclosureContext
): Partial<T> {
  const rules = DISCLOSURE_RULES[role]?.[context];
  if (!rules) {
    return {}; // No rules = no data visible
  }

  // Wildcard — return all data
  if (rules.include.includes('*')) {
    return { ...data };
  }

  const result: Record<string, unknown> = {};
  for (const field of rules.include) {
    if (field in data) {
      const masker = rules.mask?.[field];
      result[field] = masker ? masker(data[field]) : data[field];
    }
  }

  return result as Partial<T>;
}

/**
 * Mask a UUID/ID to show only last 4 characters
 */
function maskId(id: string): string {
  if (id.length <= 4) return '****';
  return '****' + id.slice(-4);
}

/**
 * Mask an email address
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '****';
  const maskedLocal = local.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask a phone number (show last 4 digits)
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return '****' + phone.slice(-4);
}
