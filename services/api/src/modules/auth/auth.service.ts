import * as argon2 from 'argon2';
import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/response.js';
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  deriveSharedSecret,
  getServerKeypair,
} from '../../crypto/sos-encryption.js';
import { extractPassportData } from '../../integrations/identity/passport-ocr.service.js';
import { sendSMS } from '../../integrations/sms/sms.service.js';
import { sendEmail } from '../../integrations/email/email.service.js';
import type {
  RegisterInput,
  LoginInput,
  AuthorityApplicationInput,
} from './auth.schemas.js';

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

// ─── Registration ───────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  // Check for duplicate
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(input.email ? [{ email: input.email }] : []),
        ...(input.phone ? [{ phone: input.phone }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new AppError(409, 'DUPLICATE_ACCOUNT', 'An account with this email or phone already exists');
  }

  // Hash password with argon2id
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.create({
    data: {
      email: input.email || null,
      phone: input.phone || null,
      passwordHash,
      role: 'tourist',
      status: 'pending', // Requires OTP verification
    },
  });

  // Generate and store OTP
  const otp = generateOTP(6);
  const otpHash = hashOTP(otp);
  const identifier = input.email || input.phone!;
  
  await redis.setex(
    `otp:verify:${identifier}`,
    600, // 10 minutes
    JSON.stringify({ otpHash, userId: user.id, attempts: 0 })
  );

  // Dispatch real SMS OTP (Temporarily commented out)
  /*
  if (input.phone) {
    await sendSMS({
      to: input.phone,
      body: `Your V.A.N.A Tourist Safety Verification OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      otp,
    });
  }
  */

  if (input.email) {
    await sendEmail({
      to: input.email,
      subject: 'V.A.N.A Tourist Account Verification OTP',
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h2>Welcome to V.A.N.A</h2>
        <p>Your account verification OTP is:</p>
        <h1 style="color:#2563eb;letter-spacing:4px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      </div>`,
      text: `Your V.A.N.A verification code is: ${otp}`,
    });
  }

  logger.info(`OTP generated for ${identifier}: ${otp}`);

  return {
    userId: user.id,
    verificationRequired: true,
  };
}

// ─── OTP Verification ───────────────────────────────────

export async function verifyOTP(identifier: string, otp: string) {
  let key = `otp:verify:${identifier}`;
  let stored = await redis.get(key);

  if (!stored) {
    key = `otp:email:${identifier}`;
    stored = await redis.get(key);
  }

  if (!stored) {
    key = `otp:phone:${identifier}`;
    stored = await redis.get(key);
  }

  if (!stored) {
    throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired or was not requested');
  }

  const { otpHash, userId, attempts } = JSON.parse(stored);

  // Max 3 attempts
  if (attempts >= 3) {
    await redis.del(key);
    throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Maximum OTP attempts reached. Please request a new OTP');
  }

  if (!verifyOTPHash(otp, otpHash)) {
    // Increment attempts
    await redis.setex(key, 300, JSON.stringify({ otpHash, userId, attempts: (attempts || 0) + 1 }));
    throw new AppError(400, 'INVALID_OTP', 'Invalid OTP code');
  }

  // Activate user if registered with userId
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });
  }

  await redis.del(key);
  
  return { userId: userId || null, verified: true };
}

// ─── Login ──────────────────────────────────────────────

export async function loginUser(input: LoginInput, deviceInfo?: string, ipAddress?: string) {
  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.identifier },
        { phone: input.identifier },
      ],
    },
    include: {
      authorityProfile: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email/phone or password');
  }

  if (user.status === 'suspended') {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
  }

  if (user.status === 'pending') {
    throw new AppError(403, 'ACCOUNT_PENDING', 'Please verify your email/phone before logging in');
  }

  // Check rate limiting for failed login attempts
  const failKey = `login:fail:${input.identifier}`;
  const failCount = parseInt(await redis.get(failKey) || '0', 10);
  if (failCount >= 5) {
    throw new AppError(429, 'TOO_MANY_ATTEMPTS', 'Account temporarily locked. Try again in 15 minutes');
  }

  // Verify password
  const passwordValid = await argon2.verify(user.passwordHash, input.password);
  if (!passwordValid) {
    await redis.setex(failKey, 900, (failCount + 1).toString()); // 15 min lockout
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email/phone or password');
  }

  // Clear failed attempts
  await redis.del(failKey);

  // Authority/admin MFA check
  if ((user.role === 'authority' || user.role === 'admin') && user.mfaEnabled) {
    // Return partial auth — client must complete MFA
    const mfaToken = await generateMFAToken(user.id);
    return {
      mfaRequired: true,
      mfaToken,
    };
  }

  // Generate tokens
  const tokens = await generateTokenPair(user.id, user.role, user.authorityProfile?.jurisdictionZoneId);
  
  // Create session
  await createSession(user.id, tokens.refreshToken, deviceInfo, ipAddress);

  return {
    mfaRequired: false,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
}

// ─── Token Generation ───────────────────────────────────

async function generateTokenPair(userId: string, role: string, jurisdictionId?: string | null) {
  const now = Math.floor(Date.now() / 1000);

  const accessToken = await new jose.SignJWT({
    role,
    ...(jurisdictionId && { jurisdictionId }),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(env.JWT_ACCESS_EXPIRY)
    .setJti(uuidv4())
    .sign(ACCESS_SECRET);

  const refreshToken = await new jose.SignJWT({ type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(env.JWT_REFRESH_EXPIRY)
    .setJti(uuidv4())
    .sign(REFRESH_SECRET);

  return { accessToken, refreshToken };
}

async function generateMFAToken(userId: string): Promise<string> {
  const token = uuidv4();
  await redis.setex(`mfa:pending:${token}`, 300, userId); // 5 min to complete MFA
  return token;
}

// ─── Session Management ─────────────────────────────────

async function createSession(
  userId: string,
  refreshToken: string,
  deviceInfo?: string,
  ipAddress?: string
) {
  const refreshTokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      expiresAt,
    },
  });
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token signature
  let payload: jose.JWTPayload;
  try {
    const result = await jose.jwtVerify(refreshToken, REFRESH_SECRET, { algorithms: ['HS256'] });
    payload = result.payload;
  } catch {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const userId = payload.sub!;
  
  // Find user's sessions and verify against one
  const sessions = await prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
  });

  let validSession = false;
  for (const session of sessions) {
    try {
      if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
        validSession = true;
        // Delete old session
        await prisma.session.delete({ where: { id: session.id } });
        break;
      }
    } catch {
      continue;
    }
  }

  if (!validSession) {
    throw new AppError(401, 'SESSION_NOT_FOUND', 'Session has been revoked or does not exist');
  }

  // Get user with authority profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { authorityProfile: true },
  });

  if (!user || user.status !== 'active') {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Account is not active');
  }

  // Generate new token pair (rotation)
  const tokens = await generateTokenPair(user.id, user.role, user.authorityProfile?.jurisdictionZoneId);
  await createSession(user.id, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

// ─── Logout ─────────────────────────────────────────────

export async function logoutUser(userId: string, refreshToken?: string) {
  if (refreshToken) {
    // Logout specific session
    const sessions = await prisma.session.findMany({ where: { userId } });
    for (const session of sessions) {
      try {
        if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
          await prisma.session.delete({ where: { id: session.id } });
          break;
        }
      } catch {
        continue;
      }
    }
  }
}

export async function logoutAllDevices(userId: string) {
  // Delete all sessions
  await prisma.session.deleteMany({ where: { userId } });
  
  // Mark all access tokens as revoked (Redis check in auth guard)
  await redis.set(`revoked:user:${userId}`, Date.now().toString(), 'EX', 900); // 15 min (max access token life)
}

// ─── Forgot / Reset Password ────────────────────────────

export async function forgotPassword(identifier: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  // Don't reveal if user exists
  if (!user) return { sent: true };

  const otp = generateOTP(6);
  const otpHash = hashOTP(otp);

  await redis.setex(
    `otp:reset:${identifier}`,
    300,
    JSON.stringify({ otpHash, userId: user.id, attempts: 0 })
  );

  // TODO: Send via SMS/email
  logger.info(`Password reset OTP for ${identifier}: ${otp} (dev only)`);

  return { sent: true };
}

export async function resetPassword(token: string, newPassword: string) {
  // Token here is the identifier used for forgot-password
  const key = `otp:reset:${token}`;
  const stored = await redis.get(key);
  
  if (!stored) {
    throw new AppError(400, 'RESET_EXPIRED', 'Reset token has expired');
  }

  const { userId } = JSON.parse(stored);

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Invalidate all sessions
  await logoutAllDevices(userId);
  await redis.del(key);

  return { success: true };
}

// ─── Authority Application ──────────────────────────────

export async function submitAuthorityApplication(
  applicantId: string,
  input: AuthorityApplicationInput
) {
  // Check for existing pending application
  const existing = await prisma.authorityApplication.findFirst({
    where: { applicantId, status: 'pending' },
  });

  if (existing) {
    throw new AppError(409, 'APPLICATION_EXISTS', 'You already have a pending application');
  }

  const application = await prisma.authorityApplication.create({
    data: {
      applicantId,
      department: input.department,
      officialEmail: input.officialEmail,
      jurisdictionDesc: input.jurisdictionDesc,
      documentRef: input.documentRef || null,
    },
  });

  return application;
}

// ─── Key Provisioning (SOS Encryption) ──────────────────

export async function provisionEncryptionKey(userId: string, clientPublicKeyB64: string) {
  const serverKeypair = getServerKeypair(env.SERVER_ENCRYPTION_SEED);
  const sharedSecret = deriveSharedSecret(serverKeypair.privateKey, clientPublicKeyB64);

  await prisma.userKey.upsert({
    where: { userId },
    update: {
      publicKey: clientPublicKeyB64,
      sharedSecret, // In production, encrypt this with a KMS key
      rotatedAt: new Date(),
    },
    create: {
      userId,
      publicKey: clientPublicKeyB64,
      sharedSecret,
    },
  });

  return {
    serverPublicKey: serverKeypair.publicKey,
  };
}

// ─── Passport OCR / KYC Verification ─────────────────────

export async function performPassportKYC(userId: string, imageBase64: string) {
  const ocrResult = await extractPassportData(imageBase64);
  if (!ocrResult.success || !ocrResult.mrz) {
    throw new AppError(422, 'PASSPORT_OCR_FAILED', ocrResult.error || 'Failed to extract passport details from image');
  }

  // Digital ID reference formatted as a verifiable hash: did:vana:passport:<country>:<docNumber>
  const digitalIdRef = `did:vana:passport:${ocrResult.mrz.issuingCountry}:${ocrResult.mrz.passportNumber}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      digitalIdRef,
      status: 'active',
    },
  });

  return {
    verified: true,
    digitalIdRef,
    passport: ocrResult.mrz,
  };
}

