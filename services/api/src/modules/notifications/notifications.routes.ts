import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { asyncHandler, sendSuccess, parsePagination } from '../../utils/response.js';
import { NotificationLog } from '../../config/mongodb.js';

const router = Router();

// GET /notifications — List user's notifications
router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      NotificationLog.find({ userId: req.user!.userId })
        .sort({ ts: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationLog.countDocuments({ userId: req.user!.userId }),
    ]);

    sendSuccess(res, notifications, { page, limit, total });
  })
);

// PATCH /notifications/:id/read — Mark as read
router.patch(
  '/:id/read',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await NotificationLog.updateOne(
      { _id: String(req.params.id), userId: req.user!.userId },
      { $set: { status: 'read' } }
    );
    sendSuccess(res, { read: true });
  })
);

export { router as notificationsRouter };
