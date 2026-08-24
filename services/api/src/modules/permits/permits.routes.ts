import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validation.js';
import { auditLog, AUDITED_ACTIONS } from '../../middleware/audit.middleware.js';
import { asyncHandler, sendSuccess, parsePagination, AppError } from '../../utils/response.js';
import { prisma } from '../../config/database.js';

const router = Router();

// POST /permits — Request a permit
router.post(
  '/',
  authGuard,
  validate({
    body: z.object({
      zoneId: z.string().uuid(),
      tripId: z.string().uuid().optional(),
      validFrom: z.string().datetime(),
      validTo: z.string().datetime(),
      partySize: z.number().int().min(1).max(50).default(1),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const zone = await prisma.dangerZone.findUnique({ where: { id: req.body.zoneId } });
    if (!zone) throw new AppError(404, 'ZONE_NOT_FOUND', 'Danger zone not found');

    // Auto-approve advisory zones, require authority approval for restricted/high_risk
    const autoApprove = zone.riskTier === 'advisory';

    const permit = await prisma.permit.create({
      data: {
        userId: req.user!.userId,
        zoneId: req.body.zoneId,
        tripId: req.body.tripId || null,
        validFrom: new Date(req.body.validFrom),
        validTo: new Date(req.body.validTo),
        partySize: req.body.partySize,
        status: autoApprove ? 'approved' : 'pending',
      },
    });

    sendSuccess(res, permit, undefined, 201);
  })
);

// GET /permits — List user's permits
router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const [permits, total] = await Promise.all([
      prisma.permit.findMany({
        where: { userId: req.user!.userId },
        include: { zone: { select: { name: true, riskTier: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.permit.count({ where: { userId: req.user!.userId } }),
    ]);
    sendSuccess(res, permits, { page, limit, total });
  })
);

// PATCH /permits/:id/approve — Authority approves permit
router.patch(
  '/:id/approve',
  authGuard,
  requireRole('authority'),
  validate({ body: z.object({ note: z.string().optional() }) }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const permit = await prisma.permit.findUnique({ where: { id: String(req.params.id) } });
    if (!permit) throw new AppError(404, 'NOT_FOUND', 'Permit not found');

    const updated = await prisma.permit.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'approved',
        approvedById: req.user!.userId,
        reviewNote: req.body.note || null,
      },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.PERMIT_APPROVE,
      'permit',
      String(req.params.id),
      req.body.note
    );

    sendSuccess(res, updated);
  })
);

// PATCH /permits/:id/reject — Authority rejects permit
router.patch(
  '/:id/reject',
  authGuard,
  requireRole('authority'),
  validate({ body: z.object({ reason: z.string().min(5) }) }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updated = await prisma.permit.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'rejected',
        approvedById: req.user!.userId,
        reviewNote: req.body.reason,
      },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.PERMIT_REJECT,
      'permit',
      String(req.params.id),
      req.body.reason
    );

    sendSuccess(res, updated);
  })
);

export { router as permitsRouter };
