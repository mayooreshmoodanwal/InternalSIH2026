/**
 * V.A.N.A SOS Protocol — Shared Package
 * (Vigilant Assistance for NER Areas)
 * 
 * Defines the compact SOS payload format used across:
 * - Step 1: HTTP body (encrypted)
 * - Step 2: SMS body (encrypted + compact)
 * - Step 3: BLE beacon (encrypted + ultra-compact)
 * 
 * Format: [SOS|H:<hash>|LA:<lat>|LO:<lng>|T:<ts>|B:<battery>]
 */

export interface SOSPayload {
  userIdHash: string;   // 8-char truncated hash
  lat: number;
  lng: number;
  timestamp: number;    // Unix seconds
  batteryLevel: number; // 0-100, -1 if unknown
  accuracy?: number;    // Meters
}

/**
 * Encode an SOS payload into the compact format.
 * Max ~80 chars — fits in a single SMS segment.
 */
export function encodeSOSPayload(payload: SOSPayload): string {
  return `[SOS|H:${payload.userIdHash}|LA:${payload.lat.toFixed(6)}|LO:${payload.lng.toFixed(6)}|T:${payload.timestamp}|B:${payload.batteryLevel}]`;
}

/**
 * Decode a compact SOS payload string.
 */
export function decodeSOSPayload(encoded: string): SOSPayload | null {
  try {
    const cleaned = encoded.replace(/[\[\]]/g, '');
    const parts = cleaned.split('|');
    
    const data: Record<string, string> = {};
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        data[part.slice(0, colonIdx).trim()] = part.slice(colonIdx + 1).trim();
      }
    }

    const lat = parseFloat(data['LA']);
    const lng = parseFloat(data['LO']);

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      userIdHash: data['H'] || '',
      lat,
      lng,
      timestamp: parseInt(data['T'], 10) || Math.floor(Date.now() / 1000),
      batteryLevel: parseInt(data['B'], 10) ?? -1,
    };
  } catch {
    return null;
  }
}

/**
 * BLE Beacon format constants
 */
export const BLE_CONSTANTS = {
  SERVICE_UUID: '0000ff01-0000-1000-8000-00805f9b34fb', // Custom Mirai SOS service
  CHAR_UUID: '0000ff02-0000-1000-8000-00805f9b34fb',    // SOS payload characteristic
  BROADCAST_INTERVAL_MS: 2000,    // Broadcast every 2 seconds
  MAX_BEACON_SIZE_BYTES: 244,     // BLE 5.0 max advertisement data
  RELAY_CACHE_DURATION_MS: 3600000, // Cache for 1 hour (dedup)
};

/**
 * SOS Cascade step definitions
 */
export enum SOSCascadeStep {
  PROACTIVE_WARNING = 0,
  INTERNET_GATEWAY = 1,
  SMS_FALLBACK = 2,
  BLE_MESH_RELAY = 3,
}

export interface CascadeStepResult {
  step: SOSCascadeStep;
  success: boolean;
  error?: string;
  timestamp: number;
}
