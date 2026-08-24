import twilio from 'twilio';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface SendSMSOptions {
  to: string; // E.164 formatted phone number (e.g., +919876543210 or +12025550123)
  body: string;
  isEmergencySOS?: boolean;
  otp?: string; // If provided, MSG91 OTP API is used for Indian numbers
}

export interface SendSMSResult {
  success: boolean;
  provider: 'msg91' | 'twilio' | 'mock_dev';
  messageId?: string;
  error?: string;
}

/**
 * Determines if a phone number belongs to India (+91)
 */
export function isIndianPhoneNumber(phone: string): boolean {
  const normalized = phone.replace(/\s+/g, '').replace(/^0+/, '');
  return normalized.startsWith('+91') || (normalized.length === 10 && /^[6-9]/.test(normalized));
}

/**
 * Formats a phone number into strict E.164 format
 */
export function toE164(phone: string): string {
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+')) return clean;
  if (clean.length === 10) return `+91${clean}`;
  return `+${clean}`;
}

/**
 * Sends SMS using Hybrid Country-Code Routing with Automatic Fallback:
 * - Indian numbers (+91) → First attempts MSG91 OTP API, falls back to Twilio on error.
 * - International numbers (+1, +44, etc.) → Routed directly through Twilio.
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const formattedPhone = toE164(options.to);
  const isIndia = isIndianPhoneNumber(formattedPhone);

  logger.info(`Routing SMS to ${formattedPhone} via ${isIndia ? 'MSG91 (India Route)' : 'Twilio (International Route)'}`);

  // ─── 1. Domestic Route (India: +91) → MSG91 OTP API ─────────────────────
  if (isIndia && env.MSG91_AUTH_KEY && options.otp) {
    try {
      // MSG91 OTP API (DLT compliant for India)
      const mobileNumber = formattedPhone.replace('+91', '91');
      const res = await fetch(
        `https://api.msg91.com/api/v5/otp?authkey=${env.MSG91_AUTH_KEY}&mobile=${mobileNumber}&message=${encodeURIComponent(options.body)}&sender=${env.MSG91_SENDER_ID || 'VANA'}&otp=${options.otp}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: options.otp }),
        }
      );

      const data: any = await res.json();
      if (data.type === 'success') {
        logger.info(`SMS sent to ${formattedPhone} via MSG91 OTP API. Response: ${JSON.stringify(data)}`);
        return {
          success: true,
          provider: 'msg91',
          messageId: data.request_id || data.message,
        };
      }
      logger.warn('MSG91 OTP API notice, proceeding to Twilio fallback:', data);
    } catch (err: any) {
      logger.warn(`MSG91 attempt error (${err.message}), falling back to Twilio`);
    }
  }

  // For Indian numbers without OTP field or MSG91 fail, try Twilio as fallback
  // ─── 2. International Route or Fallback → Twilio ────────────────────────
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
    try {
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      const message = await client.messages.create({
        to: formattedPhone,
        from: env.TWILIO_PHONE_NUMBER,
        body: options.body,
      });

      logger.info(`SMS delivered to ${formattedPhone} via Twilio SID: ${message.sid}`);
      return {
        success: true,
        provider: 'twilio',
        messageId: message.sid,
      };
    } catch (err: any) {
      logger.error(`Twilio send failed for ${formattedPhone}:`, err.message);
    }
  }

  // ─── 3. Local Development / Mock Route ──────────────────────────────────
  logger.info(`\n${'═'.repeat(60)}`);
  logger.info(`📱 [DEV SMS] TO: ${formattedPhone}`);
  logger.info(`   Body: ${options.body}`);
  logger.info(`${'═'.repeat(60)}\n`);

  return {
    success: true,
    provider: 'mock_dev',
    messageId: `mock_sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };
}
