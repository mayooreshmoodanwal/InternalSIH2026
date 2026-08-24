import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/response.js';
import { auditLog, AUDITED_ACTIONS } from '../../middleware/audit.middleware.js';
import { decryptSOSPayload, hashUserId } from '../../crypto/sos-encryption.js';
import { SMSInboundRaw, BLEInboundRaw } from '../../config/mongodb.js';
import { emitSOSAlert } from '../../websocket/alert.gateway.js';
import { sendSMS } from '../../integrations/sms/sms.service.js';
import type { SOSTriggerInput, SOSIdentityRevealInput, BLERelayInput } from './sos.schemas.js';

// ─── Step 1: Online SOS Trigger ─────────────────────────

export async function triggerSOS(userId: string, input: SOSTriggerInput) {
  // Create the SOS alert record
  const alert = await prisma.sOSAlert.create({
    data: {
      userId,
      tripId: input.tripId || null,
      triggerType: 'online',
      latitude: input.lat,
      longitude: input.lng,
      accuracy: input.accuracy || null,
      batteryLevel: input.batteryLevel || null,
      severity: 'critical',
      status: 'new_alert',
    },
  });

  // Emit real-time alert to authority dashboard via WebSocket
  await emitSOSAlert(alert);

  // Notify emergency contacts (fire and forget — non-blocking)
  notifyEmergencyContacts(userId, alert.id).catch((err) =>
    logger.error('Emergency contact notification failed:', err)
  );

  // Cache alert for fast lookup
  await redis.setex(
    `sos:active:${alert.id}`,
    86400, // 24 hours
    JSON.stringify({ userId, lat: input.lat, lng: input.lng, severity: 'critical' })
  );

  logger.info(`🚨 SOS TRIGGERED [online] by user ${userId.slice(-4)} at ${input.lat},${input.lng}`);

  return {
    alertId: alert.id,
    status: alert.status,
    notifiedContacts: await getEmergencyContactCount(userId),
  };
}

// ─── Step 2: SMS Fallback Webhook ───────────────────────

export async function processSMSWebhook(from: string, body: string) {
  // Store raw inbound for audit
  await SMSInboundRaw.create({
    from,
    bodyEncrypted: body,
    receivedAt: new Date(),
    parsed: false,
  });

  // Lookup user by phone number
  const user = await prisma.user.findFirst({
    where: { phone: from },
    include: { userKeys: true },
  });

  if (!user || !user.userKeys) {
    logger.warn(`SMS SOS from unknown/unregistered number: ${from}`);
    // Store for manual review but don't create alert from unverified sender
    await SMSInboundRaw.updateOne(
      { from, parsed: false },
      { $set: { parseError: 'Unknown sender', parsed: true } }
    );
    return { processed: false, reason: 'unknown_sender' };
  }

  // Decrypt the SOS payload
  const decrypted = decryptSOSPayload(body.trim(), user.userKeys.sharedSecret);

  if (!decrypted) {
    logger.warn(`SMS SOS decryption failed for ${from} — possible tampering`);
    await SMSInboundRaw.updateOne(
      { from, parsed: false },
      { $set: { parseError: 'Decryption failed', parsed: true } }
    );
    return { processed: false, reason: 'decryption_failed' };
  }

  // Parse the compact payload: [SOS|H:<hash>|LA:<lat>|LO:<lng>|T:<ts>|B:<battery>]
  const parsed = parseSOSPayload(decrypted);
  if (!parsed) {
    logger.warn(`SMS SOS parse failed: ${decrypted}`);
    return { processed: false, reason: 'parse_failed' };
  }

  // Create SOS alert
  const alert = await prisma.sOSAlert.create({
    data: {
      userId: user.id,
      triggerType: 'sms_fallback',
      latitude: parsed.lat,
      longitude: parsed.lng,
      batteryLevel: parsed.battery || null,
      severity: 'critical',
      status: 'new_alert',
    },
  });

  // Update raw record
  await SMSInboundRaw.updateOne(
    { from, parsed: false },
    { $set: { bodyDecrypted: decrypted, parsed: true, alertCreated: true } }
  );

  // Emit to dashboard
  await emitSOSAlert(alert);

  // Notify emergency contacts
  notifyEmergencyContacts(user.id, alert.id).catch((err) =>
    logger.error('Emergency contact notification failed:', err)
  );

  logger.info(`🚨 SOS TRIGGERED [sms_fallback] by user ${user.id.slice(-4)} at ${parsed.lat},${parsed.lng}`);

  return { processed: true, alertId: alert.id };
}

// ─── Step 3: BLE Relay Endpoint ─────────────────────────

export async function processBLERelay(relayUserId: string, input: BLERelayInput) {
  const results = [];

  for (const beacon of input.beacons) {
    // Store raw beacon for audit
    await BLEInboundRaw.create({
      relayUserId,
      beaconPayload: beacon.payload,
      rssi: beacon.rssi || null,
      receivedAt: new Date(beacon.receivedAt),
      parsed: false,
    });

    // Try to decrypt — we need to identify which user's key to use
    // The beacon contains a userId hash in the first 8 bytes
    const userIdHash = extractUserIdHashFromBeacon(beacon.payload);
    if (!userIdHash) {
      results.push({ status: 'invalid_beacon' });
      continue;
    }

    // Check deduplication
    const existing = await prisma.bLEBeaconLog.findFirst({
      where: { userIdHash },
    });

    if (existing?.alertCreated) {
      results.push({ status: 'duplicate', userIdHash });
      continue;
    }

    // Find user by hash — search through user_keys
    const userKey = await findUserByIdHash(userIdHash);
    if (!userKey) {
      results.push({ status: 'unknown_user', userIdHash });
      continue;
    }

    // Decrypt the beacon payload
    const decrypted = decryptSOSPayload(beacon.payload, userKey.sharedSecret);
    if (!decrypted) {
      results.push({ status: 'decryption_failed', userIdHash });
      continue;
    }

    const parsed = parseSOSPayload(decrypted);
    if (!parsed) {
      results.push({ status: 'parse_failed', userIdHash });
      continue;
    }

    // Create SOS alert
    const alert = await prisma.sOSAlert.create({
      data: {
        userId: userKey.userId,
        triggerType: 'ble_relay',
        latitude: parsed.lat,
        longitude: parsed.lng,
        batteryLevel: parsed.battery || null,
        severity: 'critical',
        status: 'new_alert',
        relayDeviceInfo: `Relayed by user ${relayUserId.slice(-4)}`,
      },
    });

    // Log deduplication entry
    await prisma.bLEBeaconLog.upsert({
      where: {
        userIdHash_timestampDelta: {
          userIdHash,
          timestampDelta: parsed.timestamp || 0,
        },
      },
      update: { alertCreated: true },
      create: {
        userIdHash,
        timestampDelta: parsed.timestamp || 0,
        relayUserId,
        alertCreated: true,
      },
    });

    // Update raw record
    await BLEInboundRaw.updateOne(
      { relayUserId, beaconPayload: beacon.payload, parsed: false },
      { $set: { userIdHash, parsed: true, alertCreated: true } }
    );

    // Emit and notify
    await emitSOSAlert(alert);
    notifyEmergencyContacts(userKey.userId, alert.id).catch((err) =>
      logger.error('Emergency contact notification failed:', err)
    );

    logger.info(`🚨 SOS TRIGGERED [ble_relay] for user hash ${userIdHash}, relayed by ${relayUserId.slice(-4)}`);
    results.push({ status: 'alert_created', alertId: alert.id, userIdHash });
  }

  return { processed: results.length, results };
}

// ─── Alert Management (Authority) ───────────────────────

export async function acknowledgeAlert(alertId: string, authorityId: string) {
  const alert = await prisma.sOSAlert.findUnique({ where: { id: alertId } });
  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'SOS alert not found');
  if (alert.status !== 'new_alert') {
    throw new AppError(400, 'INVALID_STATUS', 'Alert is already acknowledged');
  }

  const updated = await prisma.sOSAlert.update({
    where: { id: alertId },
    data: {
      status: 'acknowledged',
      assignedAuthorityId: authorityId,
      acknowledgedAt: new Date(),
    },
  });

  // Audit log
  await auditLog(
    authorityId,
    AUDITED_ACTIONS.ALERT_ACKNOWLEDGE,
    'sos_alert',
    alertId,
    undefined,
    { previousStatus: alert.status }
  );

  // Emit status update via WebSocket
  await emitSOSStatusUpdate(alertId, 'acknowledged');

  return updated;
}

export async function updateAlertStatus(
  alertId: string,
  authorityId: string,
  status: 'in_progress' | 'resolved',
  notes?: string
) {
  const alert = await prisma.sOSAlert.findUnique({ where: { id: alertId } });
  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'SOS alert not found');

  const updateData: Record<string, unknown> = { status };
  if (status === 'resolved') {
    updateData.resolvedAt = new Date();
  }

  const updated = await prisma.sOSAlert.update({
    where: { id: alertId },
    data: updateData as any,
  });

  // Audit log
  await auditLog(
    authorityId,
    AUDITED_ACTIONS.ALERT_STATUS_CHANGE,
    'sos_alert',
    alertId,
    notes,
    { previousStatus: alert.status, newStatus: status }
  );

  await emitSOSStatusUpdate(alertId, status);

  return updated;
}

// ─── Identity Reveal ────────────────────────────────────

export async function revealIdentity(
  alertId: string,
  authorityId: string,
  input: SOSIdentityRevealInput
) {
  const alert = await prisma.sOSAlert.findUnique({
    where: { id: alertId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          digitalIdRef: true,
          // name would come from decrypted identity — MVP simulation
        },
      },
    },
  });

  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'SOS alert not found');

  // CRITICAL: Write audit log BEFORE returning data
  // If audit fails, identity is NOT revealed
  await auditLog(
    authorityId,
    AUDITED_ACTIONS.IDENTITY_REVEAL,
    'sos_alert',
    alertId,
    input.justification,
    {
      targetUserId: alert.userId,
      alertSeverity: alert.severity,
      alertStatus: alert.status,
    }
  );

  // Mark alert as identity-revealed
  await prisma.sOSAlert.update({
    where: { id: alertId },
    data: { identityRevealed: true },
  });

  // Get emergency contacts for the tourist
  const emergencyContacts = await prisma.emergencyContact.findMany({
    where: { userId: alert.userId },
    select: { name: true, phone: true, relationship: true },
  });

  // Set a TTL for the revealed data in Redis (time-scoped access)
  await redis.setex(
    `reveal:${alertId}:${authorityId}`,
    86400, // 24 hours — data access expires after incident
    'active'
  );

  logger.info(`🔓 Identity REVEALED for alert ${alertId} by authority ${authorityId.slice(-4)}`);

  return {
    name: alert.user.email?.split('@')[0] || 'Tourist', // MVP — real name from decrypted identity in production
    documentType: alert.user.digitalIdRef ? 'Verified' : 'Unverified',
    documentRefVerified: !!alert.user.digitalIdRef,
    phone: alert.user.phone,
    emergencyContacts,
  };
}

// ─── Get Alert Status (Public — for emergency contacts) ─

export async function getAlertStatus(alertId: string) {
  const alert = await prisma.sOSAlert.findUnique({
    where: { id: alertId },
    select: {
      id: true,
      status: true,
      severity: true,
      triggerType: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
    },
  });

  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alert not found');
  return alert;
}

// ─── Helpers ────────────────────────────────────────────

function parseSOSPayload(payload: string): {
  hash?: string;
  lat: number;
  lng: number;
  timestamp?: number;
  battery?: number;
} | null {
  try {
    // Format: [SOS|H:<hash>|LA:<lat>|LO:<lng>|T:<ts>|B:<battery>]
    const cleaned = payload.replace(/[\[\]]/g, '');
    const parts = cleaned.split('|');
    
    const data: Record<string, string> = {};
    for (const part of parts) {
      const [key, value] = part.split(':');
      if (key && value) {
        data[key.trim()] = value.trim();
      }
    }

    const lat = parseFloat(data['LA']);
    const lng = parseFloat(data['LO']);

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      hash: data['H'],
      lat,
      lng,
      timestamp: data['T'] ? parseInt(data['T'], 10) : undefined,
      battery: data['B'] ? parseInt(data['B'], 10) : undefined,
    };
  } catch {
    return null;
  }
}

function extractUserIdHashFromBeacon(payloadB64: string): string | null {
  try {
    // The first 8 chars of the decrypted payload contain the user ID hash
    // But we can't decrypt without the key, so we use a public prefix
    // In practice, the beacon format includes the hash unencrypted for routing
    // while the location data is encrypted
    // Format: <8-char-hash><encrypted-payload>
    if (payloadB64.length < 12) return null;
    return payloadB64.slice(0, 8);
  } catch {
    return null;
  }
}

async function findUserByIdHash(hash: string) {
  // In production, maintain a hash-to-userId index in Redis
  // MVP: scan user_keys (acceptable for small user counts)
  const users = await prisma.userKey.findMany({
    select: { userId: true, sharedSecret: true },
  });

  for (const uk of users) {
    if (hashUserId(uk.userId) === hash) {
      return uk;
    }
  }
  return null;
}

async function getEmergencyContactCount(userId: string): Promise<number> {
  return prisma.emergencyContact.count({ where: { userId } });
}

async function notifyEmergencyContacts(userId: string, alertId: string): Promise<void> {
  const [user, alert, contacts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } }),
    prisma.sOSAlert.findUnique({ where: { id: alertId } }),
    prisma.emergencyContact.findMany({ where: { userId } }),
  ]);

  const userIdentifier = user?.email || user?.phone || 'A tourist';
  const locStr = alert ? `at GPS ${alert.latitude.toFixed(4)}°N, ${alert.longitude.toFixed(4)}°E` : 'in Northeast India';
  const messageBody = `🚨 V.A.N.A EMERGENCY SOS: ${userIdentifier} triggered distress ${locStr}. Battery: ${alert?.batteryLevel || 85}%. Authorities & contacts notified. Ref: #${alertId.substring(0, 8)}`;

  // 1. Send SMS directly to SOS Gateway Number (e.g. 9792037566)
  if (env.SOS_SMS_GATEWAY_NUMBER) {
    logger.info(`📱 Dispatching SOS SMS to Gateway / Authority Phone: ${env.SOS_SMS_GATEWAY_NUMBER}`);
    try {
      await sendSMS({
        to: env.SOS_SMS_GATEWAY_NUMBER,
        body: messageBody,
        isEmergencySOS: true,
      });
    } catch (err) {
      logger.error(`Error sending SOS SMS to gateway number ${env.SOS_SMS_GATEWAY_NUMBER}:`, err);
    }
  }

  // 2. Send SMS to all registered emergency contacts
  for (const contact of contacts) {
    logger.info(
      `📱 Sending emergency SMS to ${contact.name} (${contact.phone}) for alert ${alertId}`
    );
    try {
      await sendSMS({
        to: contact.phone,
        body: messageBody,
        isEmergencySOS: true,
      });
    } catch (smsErr) {
      logger.error(`Failed to send emergency SMS to contact ${contact.phone}:`, smsErr);
    }
  }
}

async function emitSOSStatusUpdate(alertId: string, status: string): Promise<void> {
  // Imported from websocket gateway — emits to authority room
  const { emitAlertUpdate } = await import('../../websocket/alert.gateway.js');
  await emitAlertUpdate(alertId, status);
}
