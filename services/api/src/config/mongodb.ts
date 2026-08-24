import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// ─── Schemas ─────────────────────────────────────────

const gpsPingSchema = new mongoose.Schema({
  tripId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number },
  batteryLevel: { type: Number },
  ts: { type: Date, default: Date.now, index: true },
}, {
  timeseries: { timeField: 'ts', metaField: 'tripId' },
  expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days retention
});

const aiResponseCacheSchema = new mongoose.Schema({
  destination: { type: String, required: true, index: true },
  type: { type: String, required: true }, // summary, packing_list, best_time
  season: { type: String },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
});

const notificationLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  channel: { type: String, required: true }, // push, sms, email
  type: { type: String, required: true },    // sos, geofence, permit, weather
  title: { type: String },
  body: { type: String },
  status: { type: String, default: 'sent' }, // sent, delivered, failed
  metadata: { type: mongoose.Schema.Types.Mixed },
  ts: { type: Date, default: Date.now },
});

const smsInboundRawSchema = new mongoose.Schema({
  from: { type: String, required: true },
  bodyEncrypted: { type: String, required: true },
  bodyDecrypted: { type: String },
  receivedAt: { type: Date, default: Date.now },
  parsed: { type: Boolean, default: false },
  parseError: { type: String },
  alertCreated: { type: Boolean, default: false },
});

const bleInboundRawSchema = new mongoose.Schema({
  relayUserId: { type: String, required: true },
  beaconPayload: { type: String, required: true }, // Base64 encrypted
  userIdHash: { type: String, index: true },
  receivedAt: { type: Date, default: Date.now },
  rssi: { type: Number },
  parsed: { type: Boolean, default: false },
  alertCreated: { type: Boolean, default: false },
});

export const GPSPing = mongoose.model('GPSPing', gpsPingSchema, 'gps_pings');
export const AIResponseCache = mongoose.model('AIResponseCache', aiResponseCacheSchema, 'ai_response_cache');
export const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema, 'notification_log');
export const SMSInboundRaw = mongoose.model('SMSInboundRaw', smsInboundRawSchema, 'sms_inbound_raw');
export const BLEInboundRaw = mongoose.model('BLEInboundRaw', bleInboundRawSchema, 'ble_inbound_raw');
