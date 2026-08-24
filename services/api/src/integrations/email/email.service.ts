import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp_gmail' | 'mock_dev';
  error?: string;
}

/**
 * Sends an email using Resend API first.
 * Resend free tier only delivers to the verified account owner (ayushsingh1772004@gmail.com).
 * For all other addresses, falls back to Gmail SMTP if SMTP_USER + SMTP_PASS are configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  // ─── 1. Try Resend API ─────────────────────────────────────────────────────
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'V.A.N.A Tourist Safety <onboarding@resend.dev>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const data = (await res.json()) as any;

      if (res.ok && data?.id) {
        logger.info(`✉️  Email delivered to ${options.to} via Resend. ID: ${data.id}`);
        return { success: true, messageId: data.id, provider: 'resend' };
      }

      if (res.status === 403) {
        // Resend blocks non-owner address on free tier — proceed to SMTP fallback
        logger.warn(`Resend blocked delivery to ${options.to} (free tier restriction). Trying SMTP fallback.`);
      } else {
        logger.warn(`Resend notice for ${options.to}: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      logger.error(`Resend API error: ${err.message}`);
    }
  }

  // ─── 2. Gmail SMTP fallback via Nodemailer ─────────────────────────────────
  if (env.SMTP_USER && env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS, // App password — not regular Gmail password
        },
      });

      const info = await transporter.sendMail({
        from: `V.A.N.A Safety Portal <${env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      logger.info(`✉️  Email delivered to ${options.to} via Gmail SMTP. MsgId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp_gmail' };
    } catch (err: any) {
      logger.error(`Gmail SMTP error: ${err.message}`);
    }
  }

  // ─── 3. Development fallback — log OTP to server console ──────────────────
  logger.info(`\n${'═'.repeat(60)}`);
  logger.info(`📧 [DEV EMAIL] TO: ${options.to}`);
  logger.info(`   Subject: "${options.subject}"`);
  logger.info(`   Body preview: ${(options.text || 'see HTML').slice(0, 120)}`);
  logger.info(`${'═'.repeat(60)}\n`);

  return {
    success: true,
    messageId: `dev-email-${Date.now()}`,
    provider: 'mock_dev',
  };
}
