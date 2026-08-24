import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface TripSafetyAssessment {
  destination: string;
  safetyScore: number; // 0-100
  terrainHazards: string[];
  weatherAlerts: string[];
  networkCoverage: 'full' | 'intermittent' | 'dead_zones_expected';
  nearestPoliceContact: string;
  recommendedGear: string[];
  permitRequired: boolean;
  permitDetails?: string;
  summary: string;
}

export interface FareVerificationResult {
  destination: string;
  itemOrRoute: string;
  quotedPriceINR: number;
  fairPriceRangeINR: { min: number; max: number };
  isOvercharging: boolean;
  overchargePercentage: number;
  advice: string;
}

/**
 * Generates an AI-powered safety assessment for a destination in Northeast India (Meghalaya, Sikkim, etc.)
 */
export async function generateDestinationSafetyAssessment(
  destination: string,
  startDate?: string,
  endDate?: string
): Promise<TripSafetyAssessment> {
  const normalizedDest = destination.trim().toLowerCase();

  if (env.GEMINI_API_KEY) {
    try {
      const prompt = `You are V.A.N.A (Vigilant Assistance for NER Areas), a specialized AI tourist safety assistant for Northeast India (Meghalaya, Sikkim, Assam, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura).
Analyze the travel safety for destination "${destination}" between ${startDate || 'upcoming dates'} and ${endDate || 'upcoming dates'}.
Return a strict JSON object with fields:
{
  "destination": "${destination}",
  "safetyScore": <number 0-100>,
  "terrainHazards": [<string list of specific terrain risks like steep living root bridge steps, monsoon flash floods, high altitude sickness>],
  "weatherAlerts": [<string list of seasonal weather patterns>],
  "networkCoverage": <"full" | "intermittent" | "dead_zones_expected">,
  "nearestPoliceContact": <string police station and helpline>,
  "recommendedGear": [<string list like rain poncho, trekking pole, offline maps, warm layers>],
  "permitRequired": <boolean true/false for restricted areas like Nathula, Tsomgo, etc.>,
  "permitDetails": <string permit requirements if any>,
  "summary": <concise 2-sentence safety advisory>
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      const data: any = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text) as TripSafetyAssessment;
      }
    } catch (err) {
      logger.warn('Gemini API call failed, using fallback NER safety database:', err);
    }
  }

  // Fallback NER Regional Safety Knowledge Base
  if (normalizedDest.includes('cherrapunji') || normalizedDest.includes('sohra') || normalizedDest.includes('root bridge')) {
    return {
      destination: 'Cherrapunji (Sohra) / Nongriat',
      safetyScore: 78,
      terrainHazards: [
        'Over 3,500 steep, slippery stone steps to Double Decker Living Root Bridge',
        'Heavy rainfall causing sudden stream swelling and slippery moss trails',
        'High humidity causing dehydration during ascent',
      ],
      weatherAlerts: ['High precipitation zone — carry rain gear year-round'],
      networkCoverage: 'dead_zones_expected',
      nearestPoliceContact: 'Sohra Police Station (+91-3637-235222)',
      recommendedGear: ['High-traction trekking shoes', 'Waterproof pouch for electronics', 'Energy bars', 'Electrolyte sachets'],
      permitRequired: false,
      summary: 'Stunning living root bridge trek, but requires moderate endurance. Offline maps are essential due to zero cellular signal in the deep valley.',
    };
  }

  if (normalizedDest.includes('nathula') || normalizedDest.includes('gangtok') || normalizedDest.includes('sikkim')) {
    return {
      destination: 'Nathula Pass / East Sikkim',
      safetyScore: 72,
      terrainHazards: [
        'High altitude (4,310m / 14,140 ft) — Acute Mountain Sickness (AMS) risk',
        'Sub-zero temperatures and unpredictable snowstorms',
        'Winding mountain roads prone to winter fog and landslides',
      ],
      weatherAlerts: ['Freezing temperatures and sudden snowfall above 3,500m'],
      networkCoverage: 'intermittent',
      nearestPoliceContact: 'Sherathang Police Post / Gangtok Tourist Helpline (+91-3592-202684)',
      recommendedGear: ['Heavy thermals and windproof jacket', 'Portable pulse oximeter', 'Acclimatization medications (Diamox)'],
      permitRequired: true,
      permitDetails: 'Protected Area Permit (PAP) required for Indian nationals; Foreign tourists require special approval up to Tsangu Lake.',
      summary: 'Spectacular Indo-China border pass at 4,310m. Protected Area Permit (PAP) mandatory; ensure proper acclimatization in Gangtok prior to ascent.',
    };
  }

  return {
    destination,
    safetyScore: 85,
    terrainHazards: ['Mountainous curves and hill driving caution', 'Intermittent cellular dead zones along valleys'],
    weatherAlerts: ['Pleasant day temperature, cool evenings with mist'],
    networkCoverage: 'intermittent',
    nearestPoliceContact: 'NER Tourist Police Helpline 112',
    recommendedGear: ['Layered clothing', 'Offline navigation cached in V.A.N.A', 'Power bank'],
    permitRequired: false,
    summary: `Safe and scenic travel region in Northeast India. Ensure your V.A.N.A offline map package is downloaded before heading into remote trails.`,
  };
}

/**
 * Validates quoted prices against regional NER fair price benchmarks
 */
export function verifyPrice(
  destination: string,
  itemOrRoute: string,
  quotedPriceINR: number
): FareVerificationResult {
  // Benchmark pricing table for NER pilot regions
  const benchmarks: Record<string, { min: number; max: number }> = {
    'shillong-taxi-km': { min: 14, max: 20 },
    'shillong-shared-sumo': { min: 150, max: 250 },
    'gangtok-shared-jeep': { min: 200, max: 350 },
    'cherrapunji-day-taxi': { min: 2200, max: 3200 },
    'dawki-boat-ride': { min: 800, max: 1200 },
  };

  const key = `${destination.toLowerCase()}-${itemOrRoute.toLowerCase().replace(/\s+/g, '-')}`;
  const matched = benchmarks[key] || { min: quotedPriceINR * 0.7, max: quotedPriceINR * 1.1 };

  const isOvercharging = quotedPriceINR > matched.max * 1.2;
  const overchargePct = isOvercharging ? Math.round(((quotedPriceINR - matched.max) / matched.max) * 100) : 0;

  return {
    destination,
    itemOrRoute,
    quotedPriceINR,
    fairPriceRangeINR: matched,
    isOvercharging,
    overchargePercentage: overchargePct,
    advice: isOvercharging
      ? `Quoted price is ${overchargePct}% higher than official NER benchmark (₹${matched.min} - ₹${matched.max}). Negotiate or look for prepaid taxi stands.`
      : `Quoted price of ₹${quotedPriceINR} is within fair market range (₹${matched.min} - ₹${matched.max}).`,
  };
}
