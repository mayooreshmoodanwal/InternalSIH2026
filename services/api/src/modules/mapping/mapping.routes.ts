import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { readRateLimit } from '../../middleware/rate-limit.js';
import { validate } from '../../middleware/validation.js';
import { asyncHandler, sendSuccess, AppError } from '../../utils/response.js';
import { auditLog, AUDITED_ACTIONS } from '../../middleware/audit.middleware.js';
import { prisma } from '../../config/database.js';

const router = Router();

// GET /mapping/danger-zones — Active danger zones
router.get(
  '/danger-zones',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const zones = await prisma.dangerZone.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        polygonGeoJson: true,
        riskTier: true,
        state: true,
      },
    });

    sendSuccess(res, zones.map((z) => ({
      ...z,
      polygon: JSON.parse(z.polygonGeoJson),
    })));
  })
);

// GET /mapping/dead-zones — No/low network areas (for Step 0 caching)
router.get(
  '/dead-zones',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const zones = await prisma.deadZone.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        polygonGeoJson: true,
        signalType: true,
        state: true,
      },
    });

    sendSuccess(res, zones.map((z) => ({
      ...z,
      polygon: JSON.parse(z.polygonGeoJson),
    })));
  })
);

// GET /mapping/dead-zones/proximity — Step 0: Proactive Geo-Fenced Warnings
router.get(
  '/dead-zones/proximity',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError(400, 'INVALID_COORDINATES', 'Valid lat and lng query parameters are required');
    }

    const { checkDeadZoneProximity } = await import('../../integrations/maps/geofence.service.js');
    const result = await checkDeadZoneProximity(lat, lng);
    sendSuccess(res, result);
  })
);

// POST /mapping/geofence-check — Check if location is in danger zone
router.post(
  '/geofence-check',
  authGuard,
  validate({
    body: z.object({
      tripId: z.string().uuid().optional(),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      timestamp: z.string().datetime().optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { lat, lng, tripId } = req.body;

    // Check all active danger zones
    const zones = await prisma.dangerZone.findMany({
      where: { active: true },
    });

    let inDangerZone = false;
    let matchedZone = null;

    for (const zone of zones) {
      const polygon = JSON.parse(zone.polygonGeoJson);
      if (isPointInPolygon(lat, lng, polygon)) {
        inDangerZone = true;
        matchedZone = zone;
        break;
      }
    }

    let hasActivePermit = false;
    if (inDangerZone && matchedZone) {
      const permit = await prisma.permit.findFirst({
        where: {
          userId: req.user!.userId,
          zoneId: matchedZone.id,
          status: 'approved',
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });
      hasActivePermit = !!permit;
    }

    sendSuccess(res, {
      inDangerZone,
      zoneId: matchedZone?.id || null,
      zoneName: matchedZone?.name || null,
      permitRequired: matchedZone?.riskTier !== 'advisory',
      hasActivePermit,
    });
  })
);

// POST /mapping/danger-zones — Create danger zone (authority/admin)
router.post(
  '/danger-zones',
  authGuard,
  requireRole('authority'),
  validate({
    body: z.object({
      name: z.string().min(3),
      description: z.string().optional(),
      polygon: z.object({
        type: z.literal('Polygon'),
        coordinates: z.array(z.array(z.array(z.number()))),
      }),
      riskTier: z.enum(['advisory', 'restricted', 'high_risk']),
      state: z.string().optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const zone = await prisma.dangerZone.create({
      data: {
        name: req.body.name,
        description: req.body.description || null,
        polygonGeoJson: JSON.stringify(req.body.polygon),
        riskTier: req.body.riskTier,
        state: req.body.state || null,
        active: false, // Requires admin approval
        createdById: req.user!.userId,
      },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.ZONE_CREATE,
      'danger_zone',
      zone.id,
      undefined,
      { name: req.body.name, riskTier: req.body.riskTier }
    );

    sendSuccess(res, zone, undefined, 201);
  })
);

// PATCH /mapping/danger-zones/:id/approve — Admin approve zone
router.patch(
  '/danger-zones/:id/approve',
  authGuard,
  requireRole('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const zone = await prisma.dangerZone.update({
      where: { id: String(req.params.id) },
      data: {
        active: true,
        approvedById: req.user!.userId,
      },
    });

    await auditLog(
      req.user!.userId,
      AUDITED_ACTIONS.ZONE_APPROVE,
      'danger_zone',
      String(req.params.id)
    );

    sendSuccess(res, zone);
  })
);

// GET /mapping/welfare-points — Nearest police/hospitals
router.get(
  '/welfare-points',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Placeholder — integrate with Mapbox/Google Places API
    const lat = parseFloat(String(req.query.lat || ''));
    const lng = parseFloat(String(req.query.lng || ''));

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError(400, 'INVALID_COORDS', 'Valid lat and lng query parameters required');
    }

    // Mock data for NER region
    sendSuccess(res, {
      police: [
        {
          name: 'Tourist Police Station, Shillong',
          lat: 25.5788,
          lng: 91.8933,
          distance: '2.3 km',
          phone: '+91-364-2500100',
        },
      ],
      hospitals: [
        {
          name: 'Civil Hospital Shillong',
          lat: 25.5710,
          lng: 91.8800,
          distance: '3.1 km',
          phone: '+91-364-2224100',
        },
        {
          name: 'NEIGRIHMS Hospital',
          lat: 25.5690,
          lng: 91.9050,
          distance: '4.5 km',
          phone: '+91-364-2538012',
        },
      ],
    });
  })
);

// ─── Helper: Point-in-polygon check ─────────────────────

function isPointInPolygon(lat: number, lng: number, geoJson: { type: string; coordinates: number[][][] }): boolean {
  if (geoJson.type !== 'Polygon' || !geoJson.coordinates?.[0]) return false;
  
  const ring = geoJson.coordinates[0];
  let inside = false;
  
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1], yi = ring[i][0];
    const xj = ring[j][1], yj = ring[j][0];
    
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

export { router as mappingRouter };
