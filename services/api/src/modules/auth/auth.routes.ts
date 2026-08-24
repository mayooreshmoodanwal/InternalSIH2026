import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import { authGuard, AuthenticatedRequest } from '../../middleware/auth.guard.js';
import { authRateLimit } from '../../middleware/rate-limit.js';
import { asyncHandler, sendSuccess, sendError } from '../../utils/response.js';
import {
  registerSchema,
  verifyOTPSchema,
  loginSchema,
  loginOTPSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  authorityApplicationSchema,
  registerKeySchema,
  passportKYCSchema,
} from './auth.schemas.js';
import {
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  submitAuthorityApplication,
  provisionEncryptionKey,
  performPassportKYC,
} from './auth.service.js';

const router = Router();

// POST /auth/register — Create account
router.post(
  '/register',
  authRateLimit,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    sendSuccess(res, result, undefined, 201);
  })
);

// POST /auth/verify-otp — Verify email/phone
router.post(
  '/verify-otp',
  authRateLimit,
  validate({ body: verifyOTPSchema }),
  asyncHandler(async (req, res) => {
    const { identifier, otp } = req.body;
    const result = await verifyOTP(identifier, otp);
    sendSuccess(res, result);
  })
);

// POST /auth/login — Login with password
router.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const deviceInfo = req.headers['user-agent'] || undefined;
    const ipAddress = req.ip || undefined;
    const result = await loginUser(req.body, deviceInfo, ipAddress);
    sendSuccess(res, result);
  })
);

// POST /auth/login-otp — Request login OTP
router.post(
  '/login-otp',
  authRateLimit,
  validate({ body: loginOTPSchema }),
  asyncHandler(async (req, res) => {
    // TODO: Implement OTP-based login
    sendSuccess(res, { sent: true });
  })
);

// POST /auth/refresh — Exchange refresh token
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  asyncHandler(async (req, res) => {
    const result = await refreshAccessToken(req.body.refreshToken);
    sendSuccess(res, result);
  })
);

// POST /auth/logout — Invalidate current session
router.post(
  '/logout',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const refreshToken = req.body?.refreshToken;
    await logoutUser(req.user!.userId, refreshToken);
    sendSuccess(res, { loggedOut: true });
  })
);

// POST /auth/logout-all — Invalidate all sessions
router.post(
  '/logout-all',
  authGuard,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await logoutAllDevices(req.user!.userId);
    sendSuccess(res, { loggedOut: true, allDevices: true });
  })
);

// POST /auth/forgot-password — Trigger reset
router.post(
  '/forgot-password',
  authRateLimit,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(async (req, res) => {
    const result = await forgotPassword(req.body.identifier);
    sendSuccess(res, result);
  })
);

// POST /auth/reset-password — Set new password (token-based flow)
router.post(
  '/reset-password',
  authRateLimit,
  validate({ body: resetPasswordSchema }),
  asyncHandler(async (req, res) => {
    const result = await resetPassword(req.body.token, req.body.newPassword);
    sendSuccess(res, result);
  })
);

// POST /auth/reset-password-direct — Reset password after OTP verification (identifier-based)
router.post(
  '/reset-password-direct',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'identifier and newPassword are required');
    }
    const { prisma } = await import('../../config/database.js');
    const { argon2 } = await import('argon2' as any);
    const argon2Mod = await import('argon2');
    const passwordHash = await argon2Mod.hash(newPassword, { type: argon2Mod.argon2id });
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'No account found with this identifier');
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    sendSuccess(res, { updated: true });
  })
);

// POST /auth/authority/apply — Submit authority account application
router.post(
  '/authority/apply',
  authGuard,
  validate({ body: authorityApplicationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await submitAuthorityApplication(req.user!.userId, req.body);
    sendSuccess(res, result, undefined, 201);
  })
);

// POST /auth/provision-key — Register encryption public key (for SOS)
router.post(
  '/provision-key',
  authGuard,
  validate({ body: registerKeySchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await provisionEncryptionKey(req.user!.userId, req.body.publicKey);
    sendSuccess(res, result);
  })
);

// POST /auth/check-email — Check if email exists in DB
router.post(
  '/check-email',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const { prisma } = await import('../../config/database.js');
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, status: true },
    });
    sendSuccess(res, { exists: !!user, user });
  })
);

// POST /auth/send-email-otp — Dispatch real email OTP via Resend
router.post(
  '/send-email-otp',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const { sendEmail } = await import('../../integrations/email/email.service.js');
    const { generateOTP, hashOTP } = await import('../../crypto/sos-encryption.js');
    const { redis } = await import('../../config/redis.js');

    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    await redis.setex(`otp:email:${email}`, 600, JSON.stringify({ otpHash, attempts: 0 }));

    const result = await sendEmail({
      to: email,
      subject: 'V.A.N.A Security Verification Code',
      html: `<div style="font-family:sans-serif;padding:24px;border:1px solid #e2e8f0;border-radius:8px;max-width:500px;">
        <h2 style="color:#0f172a;">V.A.N.A Tourist Safety Network</h2>
        <p style="color:#475569;">Your 6-digit email verification code is:</p>
        <div style="background:#f1f5f9;padding:14px;border-radius:6px;font-size:26px;font-weight:800;letter-spacing:6px;color:#2563eb;text-align:center;">${otp}</div>
        <p style="color:#64748b;font-size:12px;margin-top:16px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
      text: `Your V.A.N.A verification code is: ${otp}`,
    });

    sendSuccess(res, { sent: true, provider: result.provider, messageId: result.messageId });
  })
);

// POST /auth/send-phone-otp — Dispatch real SMS OTP via MSG91 / Twilio
router.post(
  '/send-phone-otp',
  asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const { sendSMS } = await import('../../integrations/sms/sms.service.js');
    const { generateOTP, hashOTP } = await import('../../crypto/sos-encryption.js');
    const { redis } = await import('../../config/redis.js');

    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    await redis.setex(`otp:phone:${phone}`, 600, JSON.stringify({ otpHash, attempts: 0 }));

    const smsResult = await sendSMS({
      to: phone,
      body: `Your V.A.N.A Tourist Safety Verification Code is: ${otp}. Valid for 10 minutes. Do not share.`,
      otp,
    });

    sendSuccess(res, { sent: true, provider: smsResult.provider, messageId: smsResult.messageId });
  })
);

// POST /auth/register-full-authority — Complete authority registration
router.post(
  '/register-full-authority',
  asyncHandler(async (req, res) => {
    const { email, phone, password, name, designation, department, idType, idNumber, stationInfo } = req.body;
    const { prisma } = await import('../../config/database.js');
    const argon2 = await import('argon2');

    const passwordHash = await argon2.hash(password || 'Authority@2026', {
      type: argon2.argon2id,
    });

    const docMeta = JSON.stringify({
      name: name || 'Officer',
      designation: designation || 'Inspector',
      department: department || 'Meghalaya Police',
      idType: idType || 'Service ID',
      idNumber: idNumber || `AUTH-${Date.now().toString().slice(-4)}`,
      stationInfo: stationInfo || 'Command Post',
    });

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'authority',
        status: 'pending',
      },
    });

    const profile = await prisma.authorityProfile.create({
      data: {
        userId: user.id,
        department: department || 'Meghalaya Police',
        verificationDocRef: docMeta,
      },
    });

    try {
      await prisma.authorityApplication.create({
        data: {
          applicantId: user.id,
          department: department || 'Meghalaya Police',
          officialEmail: email,
          jurisdictionDesc: stationInfo || 'Northeast Regional Command',
          documentRef: docMeta,
          status: 'pending',
        },
      });
    } catch {}

    sendSuccess(res, { user, profile, status: 'pending' }, undefined, 201);
  })
);

// POST /auth/register-full-tourist — Complete tourist registration with emergency contacts
router.post(
  '/register-full-tourist',
  asyncHandler(async (req, res) => {
    const { email, phone, password, name, digitalIdRef, emergencyContacts } = req.body;
    const { prisma } = await import('../../config/database.js');
    const argon2 = await import('argon2');

    const passwordHash = await argon2.hash(password || 'Tourist@2026', {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'tourist',
        status: 'active',
        digitalIdRef: digitalIdRef || null,
      },
    });

    if (Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      await prisma.emergencyContact.createMany({
        data: emergencyContacts.map((c: any) => ({
          userId: user.id,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship || 'Emergency Contact',
        })),
      });
    }

    sendSuccess(res, { user, status: 'active' }, undefined, 201);
  })
);

// GET /auth/authorities — Get all authorities for Admin review
router.get(
  '/authorities',
  asyncHandler(async (_req, res) => {
    const { prisma } = await import('../../config/database.js');
    const authorities = await prisma.user.findMany({
      where: { role: 'authority' },
      include: { authorityProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = authorities.map((u) => {
      let docData: any = {};
      try {
        if (u.authorityProfile?.verificationDocRef) {
          docData = JSON.parse(u.authorityProfile.verificationDocRef);
        }
      } catch {}

      return {
        id: u.id,
        name: docData.name || u.email?.split('@')[0] || 'Officer',
        email: u.email,
        phone: u.phone || 'N/A',
        department: docData.department || u.authorityProfile?.department || 'Police Department',
        designation: docData.designation || 'Inspector',
        idNumber: docData.idNumber || `AUTH-${u.id.slice(-4)}`,
        stationInfo: docData.stationInfo || 'Regional Outpost',
        status: u.status,
        date: u.createdAt.toISOString().split('T')[0],
      };
    });

    sendSuccess(res, formatted);
  })
);

// PATCH /auth/authorities/:id/approve — Admin approves authority with granular permissions
router.patch(
  '/authorities/:id/approve',
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { permissions } = req.body;
    const { prisma } = await import('../../config/database.js');

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: { status: 'active' },
      include: { authorityProfile: true },
    });

    sendSuccess(res, { user: updated, permissions });
  })
);

export { router as authRouter };

