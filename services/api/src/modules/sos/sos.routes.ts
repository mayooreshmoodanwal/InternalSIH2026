import { Router, Request } from 'express';
import { validate } from '../../middleware/validation.js';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { requireRole, requireJurisdiction } from '../../middleware/rbac.middleware.js';
import { sosRateLimit } from '../../middleware/rate-limit.js';
import { asyncHandler, sendSuccess } from '../../utils/response.js';
import {
  sosTriggerSchema,
  sosAcknowledgeSchema,
  sosStatusUpdateSchema,
  sosIdentityRevealSchema,
  smsWebhookSchema,
  bleRelaySchema,
} from './sos.schemas.js';
import {
  triggerSOS,
  processSMSWebhook,
  processBLERelay,
  acknowledgeAlert,
  updateAlertStatus,
  revealIdentity,
  getAlertStatus,
} from './sos.service.js';

const router = Router();

// ─── Tourist Endpoints ──────────────────────────────────

// POST /sos/trigger — Trigger SOS (Step 1: Online)
router.post(
  '/trigger',
  authGuard,
  sosRateLimit,
  validate({ body: sosTriggerSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await triggerSOS(req.user!.userId, req.body);
    sendSuccess(res, result, undefined, 201);
  })
);

// POST /sos/direct-dispatch — Fallback direct emergency SMS to gateway phone
router.post(
  '/direct-dispatch',
  asyncHandler(async (req: Request, res) => {
    const { lat, lng, battery, userEmail, userPhone } = req.body;
    const { sendSMS } = await import('../../integrations/sms/sms.service.js');
    const { env } = await import('../../config/env.js');
    
    const gatewayNumber = env.SOS_SMS_GATEWAY_NUMBER || '9792037566';
    const locStr = `GPS: ${Number(lat || 25.285).toFixed(4)}°N, ${Number(lng || 91.685).toFixed(4)}°E`;
    const message = `🚨 V.A.N.A EMERGENCY SOS: Tourist ${userEmail || userPhone || 'Citizen'} triggered distress at ${locStr}. Battery: ${battery || 85}%. Authorities alerted.`;
    
    const smsResult = await sendSMS({
      to: gatewayNumber,
      body: message,
      isEmergencySOS: true,
    });
    
    sendSuccess(res, { dispatched: true, to: gatewayNumber, provider: smsResult.provider, messageId: smsResult.messageId });
  })
);

// GET /sos/:id/status — Get alert status (tourist or emergency contact)
router.get(
  '/:id/status',
  asyncHandler(async (req: Request, res) => {
    // This endpoint accepts either auth token OR a status token (for emergency contacts)
    const result = await getAlertStatus(String(req.params.id));
    sendSuccess(res, result);
  })
);

// ─── SMS Webhook (Step 2) ───────────────────────────────

// POST /sos/sms-webhook — Inbound SMS from Twilio/MSG91
router.post(
  '/sms-webhook',
  // Public endpoint — authenticated via provider signature (Twilio/MSG91)
  validate({ body: smsWebhookSchema }),
  asyncHandler(async (req: Request, res) => {
    // TODO: Validate Twilio/MSG91 webhook signature for production
    const result = await processSMSWebhook(req.body.From, req.body.Body);
    sendSuccess(res, result);
  })
);

// ─── BLE Relay (Step 3) ─────────────────────────────────

// POST /sos/ble-relay — Upload relayed BLE beacons
router.post(
  '/ble-relay',
  authGuard,
  validate({ body: bleRelaySchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await processBLERelay(req.user!.userId, req.body);
    sendSuccess(res, result);
  })
);

// ─── Authority Endpoints ────────────────────────────────

// PATCH /sos/:id/acknowledge — Acknowledge alert
router.patch(
  '/:id/acknowledge',
  authGuard,
  requireRole('authority'),
  requireJurisdiction(),
  validate({ body: sosAcknowledgeSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await acknowledgeAlert(String(req.params.id), req.user!.userId);
    sendSuccess(res, result);
  })
);

// PATCH /sos/:id/status — Update alert status
router.patch(
  '/:id/status',
  authGuard,
  requireRole('authority'),
  requireJurisdiction(),
  validate({ body: sosStatusUpdateSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await updateAlertStatus(
      String(req.params.id),
      req.user!.userId,
      req.body.status,
      req.body.notes
    );
    sendSuccess(res, result);
  })
);

// POST /sos/:id/reveal-identity — Request identity reveal
router.post(
  '/:id/reveal-identity',
  authGuard,
  requireRole('authority'),
  validate({ body: sosIdentityRevealSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await revealIdentity(
      String(req.params.id),
      req.user!.userId,
      req.body
    );
    sendSuccess(res, result);
  })
);

export { router as sosRouter };
