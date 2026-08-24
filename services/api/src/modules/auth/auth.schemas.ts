import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+\d{10,15}$/, 'Phone must be in E.164 format').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone number is required' }
);

export const verifyOTPSchema = z.object({
  identifier: z.string().min(1), // email or phone
  otp: z.string().length(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(1), // email or phone
  password: z.string().min(1),
});

export const loginOTPSchema = z.object({
  identifier: z.string().min(1), // email or phone
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export const authorityApplicationSchema = z.object({
  department: z.string().min(2),
  officialEmail: z.string().email(),
  jurisdictionDesc: z.string().min(5),
  documentRef: z.string().optional(),
});

// Client sends their X25519 public key during registration
export const registerKeySchema = z.object({
  publicKey: z.string().min(32), // Base64 encoded X25519 public key
});

export const passportKYCSchema = z.object({
  imageBase64: z.string().min(100, 'Valid base64 image data is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthorityApplicationInput = z.infer<typeof authorityApplicationSchema>;
export type PassportKYCInput = z.infer<typeof passportKYCSchema>;
