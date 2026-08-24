import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as jose from 'jose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';

let io: Server;

/**
 * Initialize the WebSocket gateway for real-time SOS alerts.
 * Authority dashboard clients connect and join jurisdiction-scoped rooms.
 */
export function initWebSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  // Authentication on connection
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
      const { payload } = await jose.jwtVerify(token, secret, {
        algorithms: ['HS256'],
      });

      if (!payload.sub || !payload.role) {
        return next(new Error('Invalid token'));
      }

      // Only authority and admin can connect to alerts namespace
      if (payload.role !== 'authority' && payload.role !== 'admin') {
        return next(new Error('Unauthorized role'));
      }

      // Attach user data to socket
      (socket as any).userId = payload.sub;
      (socket as any).role = payload.role;
      (socket as any).jurisdictionId = payload.jurisdictionId;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;
    const jurisdictionId = (socket as any).jurisdictionId;

    logger.info(`WebSocket connected: ${role} user ${userId.slice(-4)}`);

    // Join jurisdiction-scoped room
    if (jurisdictionId) {
      socket.join(`jurisdiction:${jurisdictionId}`);
      logger.debug(`User ${userId.slice(-4)} joined room jurisdiction:${jurisdictionId}`);
    }

    // Admin joins all rooms
    if (role === 'admin') {
      socket.join('admin:all');
    }

    // Join user-specific room for direct messages
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${role} user ${userId.slice(-4)}`);
    });
  });

  logger.info('✅ WebSocket gateway initialized');
  return io;
}

/**
 * Emit a new SOS alert to the appropriate jurisdiction room.
 */
export async function emitSOSAlert(alert: {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  severity: string;
  triggerType: string;
  tripId?: string | null;
}): Promise<void> {
  if (!io) return;

  const event = {
    alertId: alert.id,
    location: { lat: alert.latitude, lng: alert.longitude },
    severity: alert.severity,
    triggerType: alert.triggerType,
    tripId: alert.tripId,
    timestamp: new Date().toISOString(),
    // userId is MASKED — authority only sees last 4 chars until identity reveal
    userIdMasked: '****' + alert.userId.slice(-4),
  };

  // Find the appropriate jurisdiction for this location
  // For MVP: broadcast to all authority rooms + admin
  // Production: use PostGIS to find which jurisdiction polygon contains the alert coordinates
  io.to('admin:all').emit('sos:new', event);
  
  // Broadcast to all jurisdiction rooms (MVP simplification)
  const rooms = io.sockets.adapter.rooms;
  for (const [roomName] of rooms) {
    if (roomName.startsWith('jurisdiction:')) {
      io.to(roomName).emit('sos:new', event);
    }
  }

  logger.info(`📡 SOS alert ${alert.id} emitted via WebSocket`);
}

/**
 * Emit an alert status update.
 */
export async function emitAlertUpdate(alertId: string, status: string): Promise<void> {
  if (!io) return;

  io.emit('sos:updated', {
    alertId,
    status,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit a geofence breach event.
 */
export async function emitGeofenceBreach(
  userId: string,
  zoneId: string,
  severity: string
): Promise<void> {
  if (!io) return;

  io.emit('geofence:breach', {
    userIdMasked: '****' + userId.slice(-4),
    zoneId,
    severity,
    timestamp: new Date().toISOString(),
  });
}

export function getIO(): Server | null {
  return io;
}
