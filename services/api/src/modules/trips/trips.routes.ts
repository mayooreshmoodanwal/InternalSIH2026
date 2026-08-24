import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { validate } from '../../middleware/validation.js';
import { readRateLimit } from '../../middleware/rate-limit.js';
import { asyncHandler, sendSuccess, sendError, parsePagination, AppError } from '../../utils/response.js';
import { prisma } from '../../config/database.js';
import { AIResponseCache } from '../../config/mongodb.js';
import { generateDestinationSafetyAssessment } from '../../integrations/ai/gemini.service.js';

const router = Router();

// Schemas
const createTripSchema = z.object({
  destination: z.string().min(2).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transportMode: z.string().min(2),
});

const updateTripSchema = z.object({
  destination: z.string().min(2).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  transportMode: z.string().min(2).optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
});

// POST /trips — Create a trip
router.post(
  '/',
  authGuard,
  validate({ body: createTripSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.create({
      data: {
        userId: req.user!.userId,
        destination: req.body.destination,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        transportMode: req.body.transportMode,
        status: 'planned',
      },
    });
    sendSuccess(res, trip, undefined, 201);
  })
);

// GET /trips — List user's trips
router.get(
  '/',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: { userId: req.user!.userId },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.trip.count({ where: { userId: req.user!.userId } }),
    ]);
    sendSuccess(res, trips, { page, limit, total });
  })
);

// GET /trips/:id — Get trip detail
router.get(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
    sendSuccess(res, trip);
  })
);

// PATCH /trips/:id — Update trip
router.patch(
  '/:id',
  authGuard,
  validate({ body: updateTripSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');
    if (trip.status !== 'planned') {
      throw new AppError(400, 'INVALID_STATUS', 'Can only edit planned trips');
    }

    const updated = await prisma.trip.update({
      where: { id: String(req.params.id) },
      data: {
        ...(req.body.destination && { destination: req.body.destination }),
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
        ...(req.body.transportMode && { transportMode: req.body.transportMode }),
        ...(req.body.status && { status: req.body.status }),
      },
    });
    sendSuccess(res, updated);
  })
);

// DELETE /trips/:id — Cancel a trip
router.delete(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');

    await prisma.trip.update({
      where: { id: String(req.params.id) },
      data: { status: 'cancelled' },
    });
    sendSuccess(res, { cancelled: true });
  })
);

// GET /trips/:id/ai-summary — Get AI destination summary
router.get(
  '/:id/ai-summary',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');

    // Check cache first
    const cached = await AIResponseCache.findOne({
      destination: trip.destination,
      type: 'summary',
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      sendSuccess(res, {
        destination: trip.destination,
        summary: cached.content,
        cached: true,
        generatedAt: cached.generatedAt,
      });
      return;
    }

    // Generate AI Safety & Destination Assessment
    const assessment = await generateDestinationSafetyAssessment(
      trip.destination,
      trip.startDate.toISOString().split('T')[0],
      trip.endDate.toISOString().split('T')[0]
    );

    // Cache for 24 hours
    try {
      await AIResponseCache.create({
        destination: trip.destination,
        type: 'summary',
        content: assessment.summary,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } catch {
      // ignore cache write error
    }

    sendSuccess(res, {
      destination: trip.destination,
      summary: assessment.summary,
      safetyAssessment: assessment,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  })
);

// GET /trips/:id/packing-list — Weather-based packing list
router.get(
  '/:id/packing-list',
  authGuard,
  readRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trip = await prisma.trip.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!trip) throw new AppError(404, 'NOT_FOUND', 'Trip not found');

    // Placeholder — integrate with weather API + AI
    const packingList = {
      destination: trip.destination,
      essentials: [
        'Valid ID / Passport', 'Phone charger / Power bank',
        'First aid kit', 'Torch / Flashlight', 'Water bottle',
      ],
      clothing: [
        'Rain jacket / Poncho', 'Warm layers (temperatures can drop)',
        'Comfortable trekking shoes', 'Quick-dry clothes',
      ],
      safety: [
        'Emergency whistle', 'Offline maps downloaded',
        'Emergency contact card (printed)', 'Basic medications',
      ],
      documents: [
        'Inner Line Permit (if required)', 'Hotel booking confirmations',
        'Travel insurance documents',
      ],
    };

    sendSuccess(res, packingList);
  })
);

export { router as tripsRouter };
