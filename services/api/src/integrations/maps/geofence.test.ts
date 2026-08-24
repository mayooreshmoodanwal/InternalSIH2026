import { calculateDistanceMeters, isPointInPolygon } from './geofence.service.js';

describe('Geofence & Dead-Zone Service (Step 0)', () => {
  it('should calculate accurate distance in meters between two coordinates', () => {
    // Distance between Shillong (25.5788, 91.8933) and Cherrapunji (25.2850, 91.6850) is ~38-40km
    const dist = calculateDistanceMeters(25.5788, 91.8933, 25.2850, 91.6850);
    expect(dist).toBeGreaterThan(35000);
    expect(dist).toBeLessThan(45000);
  });

  it('should detect if a coordinate point is inside a polygon', () => {
    const polygon: number[][][] = [
      [
        [91.6800, 25.2800],
        [91.6900, 25.2800],
        [91.6900, 25.2900],
        [91.6800, 25.2900],
        [91.6800, 25.2800],
      ],
    ];

    // Inside point
    expect(isPointInPolygon([91.6850, 25.2850], polygon)).toBe(true);

    // Outside point
    expect(isPointInPolygon([91.7000, 25.3000], polygon)).toBe(false);
  });
});
