import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_VERSION: z.string().default('v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().default('postgresql://vana:vana_dev@localhost:5432/vana_dev?schema=public'),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32).default('test_access_secret_change_me_in_production_32chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('test_refresh_secret_change_me_in_production_32chars'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  // Encryption
  SERVER_ENCRYPTION_SEED: z.string().min(32).default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // External APIs (optional in dev)
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_CLOUD_VISION_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  NUMBEO_API_KEY: z.string().optional(),

  // SMS
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('VANA'),
  SOS_SMS_GATEWAY_NUMBER: z.string().optional(),

  // Identity
  DIGILOCKER_CLIENT_ID: z.string().optional(),
  DIGILOCKER_CLIENT_SECRET: z.string().optional(),
  POLYGON_ID_ISSUER_URL: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  // Gmail SMTP fallback (use App Password from https://myaccount.google.com/apppasswords)
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),

  // Pilot
  PILOT_REGION: z.string().default('NER'),
  PILOT_STATES: z.string().default('Meghalaya,Sikkim'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { env };
