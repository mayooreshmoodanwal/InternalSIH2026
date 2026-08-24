import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { readRateLimit } from '../../middleware/rate-limit.js';
import { validate } from '../../middleware/validation.js';
import { asyncHandler, sendSuccess, parsePagination } from '../../utils/response.js';
import { prisma } from '../../config/database.js';

const router = Router();

// GET /economy/fares — Typical fares for a destination
router.get(
  '/fares',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const destination = String(String(req.query.destination || "") || '');
    if (!destination) {
      sendSuccess(res, []);
      return;
    }

    let fares = await prisma.faresCache.findMany({
      where: { destination: { contains: destination, mode: 'insensitive' } },
    });

    // If no cached data, return defaults for NER
    if (fares.length === 0) {
      fares = getDefaultFares(destination) as any;
    }

    sendSuccess(res, fares);
  })
);

// GET /economy/utilities — Typical prices for food/basic goods
router.get(
  '/utilities',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const destination = String(String(req.query.destination || "") || '');
    if (!destination) {
      sendSuccess(res, []);
      return;
    }

    let utilities = await prisma.utilitiesCache.findMany({
      where: { destination: { contains: destination, mode: 'insensitive' } },
    });

    if (utilities.length === 0) {
      utilities = getDefaultUtilities(destination) as any;
    }

    sendSuccess(res, utilities);
  })
);

// POST /economy/scam-reports — Submit scam report
router.post(
  '/scam-reports',
  authGuard,
  validate({
    body: z.object({
      category: z.enum(['transport', 'food', 'accommodation', 'shopping', 'other']),
      amountCharged: z.number().positive(),
      expectedAmount: z.number().positive().optional(),
      description: z.string().max(500).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      locationDesc: z.string().max(200).optional(),
    }),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const report = await prisma.scamReport.create({
      data: {
        userId: req.user!.userId,
        category: req.body.category,
        amountCharged: req.body.amountCharged,
        expectedAmount: req.body.expectedAmount || null,
        description: req.body.description || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        locationDesc: req.body.locationDesc || null,
        status: 'open',
      },
    });

    sendSuccess(res, { reportId: report.id, status: 'open' }, undefined, 201);
  })
);

// ─── Default data for NER pilot ─────────────────────────

function getDefaultFares(destination: string) {
  return [
    { destination, category: 'taxi_per_km', value: 15, currency: 'INR', source: 'estimated' },
    { destination, category: 'auto_per_km', value: 10, currency: 'INR', source: 'estimated' },
    { destination, category: 'shared_sumo', value: 200, currency: 'INR', source: 'estimated' },
    { destination, category: 'local_bus', value: 30, currency: 'INR', source: 'estimated' },
    { destination, category: 'bike_rental_per_day', value: 800, currency: 'INR', source: 'estimated' },
  ];
}

function getDefaultUtilities(destination: string) {
  return [
    { destination, category: 'bottled_water_1L', value: 20, currency: 'INR', source: 'estimated' },
    { destination, category: 'basic_meal', value: 150, currency: 'INR', source: 'estimated' },
    { destination, category: 'restaurant_meal', value: 400, currency: 'INR', source: 'estimated' },
    { destination, category: 'local_sim', value: 250, currency: 'INR', source: 'estimated' },
    { destination, category: 'tea_coffee', value: 20, currency: 'INR', source: 'estimated' },
    { destination, category: 'snacks', value: 50, currency: 'INR', source: 'estimated' },
  ];
}

export { router as economyRouter };
