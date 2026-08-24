import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { connectMongoDB } from './config/mongodb.js';
import { redis } from './config/redis.js';
import { initCrypto } from './crypto/sos-encryption.js';
import { initWebSocket } from './websocket/alert.gateway.js';
import { logger } from './utils/logger.js';
import { sendError, AppError } from './utils/response.js';

// Route imports
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { tripsRouter } from './modules/trips/trips.routes.js';
import { economyRouter } from './modules/economy/economy.routes.js';
import { mappingRouter } from './modules/mapping/mapping.routes.js';
import { sosRouter } from './modules/sos/sos.routes.js';
import { permitsRouter } from './modules/permits/permits.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';

const app = express();
const httpServer = createServer(app);

// ─── Global Middleware ──────────────────────────────────

// CORS — Must be first middleware to handle all preflights
const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    
    // Allow by default to prevent CORS preflight blockages on cloud preview deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ─── API Routes ─────────────────────────────────────────

const prefix = `/api/${env.API_VERSION}`;

app.use(`${prefix}/auth`, authRouter);
app.use(`${prefix}/users`, usersRouter);
app.use(`${prefix}/trips`, tripsRouter);
app.use(`${prefix}/economy`, economyRouter);
app.use(`${prefix}/mapping`, mappingRouter);
app.use(`${prefix}/sos`, sosRouter);
app.use(`${prefix}/permits`, permitsRouter);
app.use(`${prefix}/dashboard`, dashboardRouter);
app.use(`${prefix}/admin`, adminRouter);
app.use(`${prefix}/notifications`, notificationsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'vana-api',
    version: env.API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ─────────────────────────────────────

// 404 handler
app.use((_req, res) => {
  sendError(res, 404, 'NOT_FOUND', 'The requested endpoint does not exist');
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  logger.error('Unhandled error:', err);
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
});

// ─── Server Startup ─────────────────────────────────────

async function bootstrap(): Promise<void> {
  try {
    // Initialize crypto
    await initCrypto();

    // Connect databases
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    await connectMongoDB();

    // Redis connection is automatic via ioredis
    await redis.ping();
    logger.info('✅ Redis connected');

    // Initialize WebSocket
    initWebSocket(httpServer);

    // Start HTTP server
    httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🌲 V.A.N.A — Vigilant Assistance for NER Areas         ║
║   Smart Tourist Safety Web Portal (SIH25002)             ║
║   ──────────────────────────────────────────              ║
║   Environment : ${env.NODE_ENV.padEnd(40)}║
║   API URL     : http://localhost:${String(env.PORT).padEnd(25)}║
║   API Version : ${env.API_VERSION.padEnd(40)}║
║   Pilot Region: ${env.PILOT_REGION.padEnd(40)}║
║   Pilot States: ${env.PILOT_STATES.padEnd(40)}║
║                                                          ║
║   4-Step SOS Cascade: ACTIVE                             ║
║   ├── Step 0: Dead Zone Warnings      ✅                 ║
║   ├── Step 1: Internet (HTTP/WSS)     ✅                 ║
║   ├── Step 2: SMS Fallback            ✅                 ║
║   └── Step 3: BLE Mesh Relay          ✅                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down...');
  httpServer.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

bootstrap();
