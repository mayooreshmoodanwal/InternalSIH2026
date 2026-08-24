import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export interface ProactiveWarningResult {
  inDeadZone: boolean;
  approachingDeadZone: boolean;
  distanceMeters?: number;
  deadZoneName?: string;
  signalType?: string;
  warningMessage?: string;
  shouldSyncLocally: boolean;
}

/**
 * Calculates haversine distance in meters between two GPS coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a point is inside a simple GeoJSON polygon (Ray-casting algorithm)
 */
export function isPointInPolygon(
  point: [number, number], // [lng, lat]
  polygonCoordinates: number[][][]
): boolean {
  const [x, y] = point;
  let inside = false;

  for (const ring of polygonCoordinates) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
  }

  return inside;
}

/**
 * Step 0: Proactive Geo-Fenced Warnings (Before the Emergency)
 * Evaluates whether a tourist is approaching or inside a known dead zone in NER.
 * Threshold: Warning triggered within 500m of dead zone boundary.
 */
export async function checkDeadZoneProximity(
  lat: number,
  lng: number,
  warningThresholdMeters = 500
): Promise<ProactiveWarningResult> {
  const deadZones = await prisma.deadZone.findMany({
    where: { active: true },
  });

  for (const zone of deadZones) {
    try {
      const geoJson = JSON.parse(zone.polygonGeoJson);
      if (geoJson.type === 'Polygon' && geoJson.coordinates) {
        // 1. Direct containment check
        const isInside = isPointInPolygon([lng, lat], geoJson.coordinates);
        if (isInside) {
          return {
            inDeadZone: true,
            approachingDeadZone: false,
            deadZoneName: zone.name,
            signalType: zone.signalType,
            warningMessage: `⚠️ You are currently in "${zone.name}" (${zone.signalType.replace('_', ' ')}). Offline SOS via BLE and SMS fallback is active.`,
            shouldSyncLocally: true,
          };
        }

        // 2. Proximity check to polygon centroid / perimeter vertices
        const vertices: [number, number][] = geoJson.coordinates[0];
        let minDistance = Infinity;

        for (const vertex of vertices) {
          const dist = calculateDistanceMeters(lat, lng, vertex[1], vertex[0]);
          if (dist < minDistance) minDistance = dist;
        }

        if (minDistance <= warningThresholdMeters) {
          return {
            inDeadZone: false,
            approachingDeadZone: true,
            distanceMeters: Math.round(minDistance),
            deadZoneName: zone.name,
            signalType: zone.signalType,
            warningMessage: `⚠️ Warning: You are entering "${zone.name}" (${zone.signalType.replace('_', ' ')}) in ~${Math.round(minDistance)}m. Please ensure your digital ID and itinerary are synced locally before you lose connectivity.`,
            shouldSyncLocally: true,
          };
        }
      }
    } catch (err) {
      logger.warn(`Failed to parse polygon for dead zone ${zone.name}:`, err);
    }
  }

  return {
    inDeadZone: false,
    approachingDeadZone: false,
    shouldSyncLocally: false,
  };
}
