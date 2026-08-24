import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { requireRole, requireJurisdiction } from '../../middleware/rbac.middleware.js';
import { readRateLimit } from '../../middleware/rate-limit.js';
import { asyncHandler, sendSuccess, parsePagination } from '../../utils/response.js';
import { prisma } from '../../config/database.js';

const router = Router();

// GET /dashboard/alerts — List alerts in jurisdiction
router.get(
  '/alerts',
  authGuard,
  requireRole('authority'),
  requireJurisdiction(),
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const status = req.query.status ? String(req.query.status) : undefined;
    const severity = req.query.severity ? String(req.query.severity) : undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [alerts, total] = await Promise.all([
      prisma.sOSAlert.findMany({
        where,
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          triggerType: true,
          latitude: true,
          longitude: true,
          severity: true,
          status: true,
          identityRevealed: true,
          createdAt: true,
          acknowledgedAt: true,
          resolvedAt: true,
          batteryLevel: true,
          // User ID is masked — not the actual ID
          userId: true,
        },
      }),
      prisma.sOSAlert.count({ where }),
    ]);

    // Mask user IDs for privacy
    const maskedAlerts = alerts.map((alert) => ({
      ...alert,
      userId: undefined,
      userIdMasked: '****' + alert.userId.slice(-4),
    }));

    sendSuccess(res, maskedAlerts, { page, limit, total });
  })
);

// GET /dashboard/alerts/:id — Alert detail
router.get(
  '/alerts/:id',
  authGuard,
  requireRole('authority'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const alert = await prisma.sOSAlert.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        triggerType: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        severity: true,
        status: true,
        batteryLevel: true,
        identityRevealed: true,
        relayDeviceInfo: true,
        createdAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
        userId: true,
        assignedAuthorityId: true,
      },
    });

    if (!alert) {
      sendSuccess(res, null);
      return;
    }

    sendSuccess(res, {
      ...alert,
      userId: undefined,
      userIdMasked: '****' + alert.userId.slice(-4),
    });
  })
);

// GET /dashboard/map-overview — Aggregated map data
router.get(
  '/map-overview',
  authGuard,
  requireRole('authority'),
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const [activeAlerts, dangerZones, stats] = await Promise.all([
      // Active alerts with coordinates
      prisma.sOSAlert.findMany({
        where: { status: { in: ['new_alert', 'acknowledged', 'in_progress'] } },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          severity: true,
          status: true,
          triggerType: true,
          createdAt: true,
        },
      }),
      // Danger zones
      prisma.dangerZone.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          polygonGeoJson: true,
          riskTier: true,
        },
      }),
      // Stats
      Promise.all([
        prisma.sOSAlert.count({ where: { status: 'new_alert' } }),
        prisma.sOSAlert.count({ where: { status: 'acknowledged' } }),
        prisma.sOSAlert.count({ where: { status: 'in_progress' } }),
        prisma.sOSAlert.count({
          where: {
            status: 'resolved',
            resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]),
    ]);

    sendSuccess(res, {
      activeAlerts,
      dangerZones: dangerZones.map((z) => ({
        ...z,
        polygon: JSON.parse(z.polygonGeoJson),
      })),
      stats: {
        newAlerts: stats[0],
        acknowledged: stats[1],
        inProgress: stats[2],
        resolvedLast24h: stats[3],
      },
    });
  })
);

// GET /dashboard/permits — Pending permit requests
router.get(
  '/permits',
  authGuard,
  requireRole('authority'),
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const status = (String(String(req.query.status || "") || '')) || 'pending';

    const [permits, total] = await Promise.all([
      prisma.permit.findMany({
        where: { status: status as any },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          zone: { select: { name: true, riskTier: true } },
        },
      }),
      prisma.permit.count({ where: { status: status as any } }),
    ]);

    // Mask user identity in permit data
    const maskedPermits = permits.map((p) => ({
      id: p.id,
      zoneId: p.zoneId,
      zoneName: p.zone.name,
      zoneRiskTier: p.zone.riskTier,
      validFrom: p.validFrom,
      validTo: p.validTo,
      partySize: p.partySize,
      status: p.status,
      createdAt: p.createdAt,
      userIdMasked: '****' + p.userId.slice(-4),
    }));

    sendSuccess(res, maskedPermits, { page, limit, total });
  })
);

export { router as dashboardRouter };
