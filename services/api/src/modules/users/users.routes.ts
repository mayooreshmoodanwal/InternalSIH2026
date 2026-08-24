import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { asyncHandler, sendSuccess, AppError } from '../../utils/response.js';
import { validate } from '../../middleware/validation.js';
import { prisma } from '../../config/database.js';

const router = Router();

// GET /users/me — Get current user profile
router.get(
  '/me',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        digitalIdRef: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    sendSuccess(res, user);
  })
);

// PATCH /users/me — Update profile
router.patch(
  '/me',
  authGuard,
  validate({
    body: z.object({
      email: z.string().email().optional(),
      phone: z.string().regex(/^\+\d{10,15}$/).optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(req.body.email && { email: req.body.email }),
        ...(req.body.phone && { phone: req.body.phone }),
      },
      select: { id: true, email: true, phone: true, role: true, status: true },
    });
    sendSuccess(res, updated);
  })
);

// DELETE /users/me — Request account deletion
router.delete(
  '/me',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Soft delete — mark for purge after grace period
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { status: 'suspended' }, // Will be purged after 30 days
    });
    sendSuccess(res, { deleted: true, gracePeriodDays: 30 });
  })
);

// ─── Emergency Contacts ─────────────────────────────────

// GET /users/me/emergency-contacts
router.get(
  '/me/emergency-contacts',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: req.user!.userId },
    });
    sendSuccess(res, contacts);
  })
);

// POST /users/me/emergency-contacts
router.post(
  '/me/emergency-contacts',
  authGuard,
  validate({
    body: z.object({
      name: z.string().min(2),
      phone: z.string().regex(/^\+\d{10,15}$/),
      email: z.string().email().optional(),
      relationship: z.string().min(2),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Max 5 contacts
    const count = await prisma.emergencyContact.count({
      where: { userId: req.user!.userId },
    });
    if (count >= 5) {
      throw new AppError(400, 'MAX_CONTACTS', 'Maximum 5 emergency contacts allowed');
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: req.user!.userId,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email || null,
        relationship: req.body.relationship,
      },
    });
    sendSuccess(res, contact, undefined, 201);
  })
);

// PATCH /users/me/emergency-contacts/:id
router.patch(
  '/me/emergency-contacts/:id',
  authGuard,
  validate({
    body: z.object({
      name: z.string().min(2).optional(),
      phone: z.string().regex(/^\+\d{10,15}$/).optional(),
      email: z.string().email().optional(),
      relationship: z.string().min(2).optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!contact) throw new AppError(404, 'NOT_FOUND', 'Emergency contact not found');

    const updated = await prisma.emergencyContact.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    sendSuccess(res, updated);
  })
);

// DELETE /users/me/emergency-contacts/:id
router.delete(
  '/me/emergency-contacts/:id',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!contact) throw new AppError(404, 'NOT_FOUND', 'Emergency contact not found');

    await prisma.emergencyContact.delete({ where: { id: String(req.params.id) } });
    sendSuccess(res, { deleted: true });
  })
);

// ─── Sessions ───────────────────────────────────────────

// GET /users/me/sessions
router.get(
  '/me/sessions',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user!.userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
    sendSuccess(res, sessions);
  })
);

// DELETE /users/me/sessions/:sessionId
router.delete(
  '/me/sessions/:sessionId',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await prisma.session.deleteMany({
      where: { id: String(req.params.sessionId), userId: req.user!.userId },
    });
    sendSuccess(res, { revoked: true });
  })
);

export { router as usersRouter };
