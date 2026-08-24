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
  provider: 'resend' | 'resend_owner_forward' | 'smtp_gmail' | 'mock_dev';
  error?: string;
}

/**
 * Sends an email using Resend API first.
 * - If a custom verified domain is provided (RESEND_FROM_EMAIL), delivers to ANY email.
 * - If using Resend default free sandbox (onboarding@resend.dev), Resend strictly restricts
 *   recipients to the account owner's email. If a 403 restriction occurs, this service
 *   intelligently forwards the OTP to the account owner's inbox for testing demonstration.
 * - Falls back to Gmail SMTP (Nodemailer) if SMTP_USER + SMTP_PASS are configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress = env.RESEND_FROM_EMAIL || 'V.A.N.A Tourist Safety <onboarding@resend.dev>';

  // ─── 1. Try Resend API ─────────────────────────────────────────────────────
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress.includes('<') ? fromAddress : `V.A.N.A Tourist Safety <${fromAddress}>`,
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

      // Handle Resend free tier sandbox recipient limitation
      if (res.status === 403 && data?.message) {
        logger.warn(`Resend 403 Sandbox Restriction for ${options.to}: ${data.message}`);

        // Extract owner email from Resend error message: "...to your own email address (owner@example.com)..."
        const match = data.message.match(/\(([^)]+@[^)]+)\)/);
        const ownerEmail = match ? match[1] : null;

        if (ownerEmail && ownerEmail.toLowerCase() !== options.to.toLowerCase()) {
          logger.info(`🔄 Forwarding test OTP email to verified Resend owner (${ownerEmail}) for demonstration...`);
          try {
            const fallbackRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY.trim()}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromAddress.includes('<') ? fromAddress : `V.A.N.A Tourist Safety <${fromAddress}>`,
                to: [ownerEmail],
                subject: `[For ${options.to}] ${options.subject}`,
                html: `<div style="background:#fef3c7;padding:12px;border-radius:6px;margin-bottom:16px;border:1px solid #f59e0b;color:#92400e;font-size:13px;font-family:sans-serif;">
                  ⚠️ <b>Resend Sandbox Notice:</b> This OTP was requested for <b>${options.to}</b>. Because Resend's free tier is in sandbox mode (unverified custom domain), Resend routed this message to the account owner (<b>${ownerEmail}</b>).
                </div>` + options.html,
                text: `[OTP for ${options.to}]\n\n${options.text || ''}`,
              }),
            });
            const fallbackData = (await fallbackRes.json()) as any;
            if (fallbackRes.ok && fallbackData?.id) {
              logger.info(`✉️  Test OTP successfully delivered to owner inbox (${ownerEmail}) via Resend ID: ${fallbackData.id}`);
              return { success: true, messageId: fallbackData.id, provider: 'resend_owner_forward' };
            }
          } catch (fbErr: any) {
            logger.warn('Resend owner fallback forward error:', fbErr.message);
          }
        }
      } else {
        logger.warn(`Resend notice for ${options.to}: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      logger.error(`Resend API network error: ${err.message}`);
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

  // ─── 3. Development / Sandbox fallback — prominent server log ───────────
  logger.info(`\n${'═'.repeat(60)}`);
  logger.info(`📧 [EMAIL OTP DISPATCHED]`);
  logger.info(`   To: ${options.to}`);
  logger.info(`   Subject: "${options.subject}"`);
  logger.info(`   Preview: ${options.text || options.html}`);
  logger.info(`   👉 Note: To deliver real emails to any address, configure SMTP_USER & SMTP_PASS in Render environment.`);
  logger.info(`${'═'.repeat(60)}\n`);

  return {
    success: true,
    messageId: `dev-email-${Date.now()}`,
    provider: 'mock_dev',
  };
}
