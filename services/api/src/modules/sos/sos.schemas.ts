import { z } from 'zod';

export const sosTriggerSchema = z.object({
  tripId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  triggerType: z.enum(['online']).default('online'),
});

export const sosAcknowledgeSchema = z.object({
  notes: z.string().optional(),
});

export const sosStatusUpdateSchema = z.object({
  status: z.enum(['in_progress', 'resolved']),
  notes: z.string().optional(),
});

export const sosIdentityRevealSchema = z.object({
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
});

// SMS webhook payload (from Twilio/MSG91)
export const smsWebhookSchema = z.object({
  From: z.string(),
  Body: z.string(),
  To: z.string().optional(),
  MessageSid: z.string().optional(),
});

// BLE relay payload
export const bleRelaySchema = z.object({
  beacons: z.array(z.object({
    payload: z.string(), // Base64 encrypted beacon data
    rssi: z.number().optional(),
    receivedAt: z.string().datetime(),
  })).min(1).max(100),
});

export type SOSTriggerInput = z.infer<typeof sosTriggerSchema>;
export type SOSIdentityRevealInput = z.infer<typeof sosIdentityRevealSchema>;
export type BLERelayInput = z.infer<typeof bleRelaySchema>;
