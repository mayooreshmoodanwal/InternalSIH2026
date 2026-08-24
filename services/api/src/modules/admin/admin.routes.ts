import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { auditLog, AUDITED_ACTIONS } from '../../middleware/audit.middleware.js';
import { asyncHandler, sendSuccess, parsePagination, AppError } from '../../utils/response.js';
import { validate } from '../../middleware/validation.js';
import { prisma } from '../../config/database.js';

const router = Router();

// ─── Authority Application Management ───────────────────

// GET /admin/authority-applications — List pending applications
router.get(
  '/authority-applications',
  authGuard,
  requireRole('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const status = (String(String(req.query.status || "") || '')) || 'pending';

    const [apps, total] = await Promise.all([
      prisma.authorityApplication.findMany({
        where: { status: status as any },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          applicant: {
            select: { email: true, phone: true, createdAt: true },
          },
        },
      }),
      prisma.authorityApplication.count({ where: { status: status as any } }),
    ]);

    sendSuccess(res, apps, { page, limit, total });
  })
);

// PATCH /admin/authority-applications/:id/approve
router.patch(
  '/authority-applications/:id/approve',
  authGuard,
  requireRole('admin'),
  validate({
    body: z.object({
      jurisdictionZoneId: z.string().uuid().optional(),
      note: z.string().optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const app = await prisma.authorityApplication.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!app) throw new AppError(404, 'NOT_FOUND', 'Application not found');
    if (app.status !== 'pending') {
      throw new AppError(400, 'INVALID_STATUS', 'Application is not pending');
    }

    // Update application status
    await prisma.authorityApplication.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'approved',
        reviewedById: req.user!.userId,
        reviewNote: req.body.note,
        reviewedAt: new Date(),
      },
    });

    // Upgrade user role to authority
    await prisma.user.update({
      where: { id: app.applicantId },
      data: { role: 'authority' },
    });

    // Create authority profile
    await prisma.authorityProfile.create({
      data: {
        userId: app.applicantId,
        department: app.department,
        jurisdictionZoneId: req.body.jurisdictionZoneId || null,
        verifiedByAdminId: req.user!.userId,
        verifiedAt: new Date(),
      },
    });

    // Audit log
    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.AUTHORITY_APPROVE,
      'authority_application',
      String(req.params.id),
      req.body.note,
      { applicantId: app.applicantId, department: app.department }
    );

    sendSuccess(res, { approved: true, applicantId: app.applicantId });
  })
);

// PATCH /admin/authority-applications/:id/reject
router.patch(
  '/authority-applications/:id/reject',
  authGuard,
  requireRole('admin'),
  validate({
    body: z.object({ reason: z.string().min(5) }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const app = await prisma.authorityApplication.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!app) throw new AppError(404, 'NOT_FOUND', 'Application not found');

    await prisma.authorityApplication.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'rejected',
        reviewedById: req.user!.userId,
        reviewNote: req.body.reason,
        reviewedAt: new Date(),
      },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.AUTHORITY_REJECT,
      'authority_application',
      String(req.params.id),
      req.body.reason,
      { applicantId: app.applicantId }
    );

    sendSuccess(res, { rejected: true });
  })
);

// ─── User Management ────────────────────────────────────

// GET /admin/users — List all users
router.get(
  '/users',
  authGuard,
  requireRole('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const role = req.query.role ? String(req.query.role) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          // NO location data, NO identity documents
        },
      }),
      prisma.user.count({ where: where as any }),
    ]);

    sendSuccess(res, users, { page, limit, total });
  })
);

// PATCH /admin/users/:id/suspend
router.patch(
  '/users/:id/suspend',
  authGuard,
  requireRole('admin'),
  validate({
    body: z.object({ reason: z.string().min(5) }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { status: 'suspended' },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.USER_SUSPEND,
      'user',
      String(req.params.id),
      req.body.reason
    );

    sendSuccess(res, { suspended: true });
  })
);

// PATCH /admin/users/:id/reinstate
router.patch(
  '/users/:id/reinstate',
  authGuard,
  requireRole('admin'),
  validate({
    body: z.object({ reason: z.string().min(5) }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { status: 'active' },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.USER_REINSTATE,
      'user',
      String(req.params.id),
      req.body.reason
    );

    sendSuccess(res, { reinstated: true });
  })
);

// ─── Audit Logs ─────────────────────────────────────────

// GET /admin/audit-logs — Query audit log
router.get(
  '/audit-logs',
  authGuard,
  requireRole('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const action = req.query.action ? String(req.query.action) : undefined;
    const actorId = req.query.actorId ? String(req.query.actorId) : undefined;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: { email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where: where as any }),
    ]);

    sendSuccess(res, logs, { page, limit, total });
  })
);

// ─── System Health ──────────────────────────────────────

// GET /admin/system-health — API usage and health metrics
router.get(
  '/system-health',
  authGuard,
  requireRole('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsers, activeAlerts, sosLast24h, totalTrips] = await Promise.all([
      prisma.user.count(),
      prisma.sOSAlert.count({
        where: { status: { in: ['new_alert', 'acknowledged', 'in_progress'] } },
      }),
      prisma.sOSAlert.count({ where: { createdAt: { gte: last24h } } }),
      prisma.trip.count(),
    ]);

    sendSuccess(res, {
      users: { total: totalUsers },
      alerts: { active: activeAlerts, last24h: sosLast24h },
      trips: { total: totalTrips },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: now.toISOString(),
    });
  })
);

export { router as adminRouter };
