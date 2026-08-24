import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // ─── Super Admin User (Ayush) ──────────────────────────
  const superAdminPassword = await argon2.hash('87654321', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'ayushsingh1772004@gmail.com' },
    update: {
      passwordHash: superAdminPassword,
      role: 'admin',
      status: 'active',
    },
    create: {
      email: 'ayushsingh1772004@gmail.com',
      phone: '+919999000000',
      passwordHash: superAdminPassword,
      role: 'admin',
      status: 'active',
    },
  });
  console.log(`  ✅ Super Admin: ${superAdmin.email}`);

  // ─── Ministry Admin User ─────────────────────────────
  const adminPassword = await argon2.hash('Admin@Vana2026', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vana.gov.in' },
    update: {},
    create: {
      email: 'admin@vana.gov.in',
      phone: '+919999000001',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active',
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // ─── Demo Authority User ───────────────────────────
  const authorityPassword = await argon2.hash('Authority@Vana2026', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const authority = await prisma.user.upsert({
    where: { email: 'inspector@meghalaya.police.gov.in' },
    update: {},
    create: {
      email: 'inspector@meghalaya.police.gov.in',
      phone: '+919999000002',
      passwordHash: authorityPassword,
      role: 'authority',
      status: 'active',
    },
  });
  console.log(`  ✅ Authority: ${authority.email}`);

  // ─── Demo Tourist User ─────────────────────────────
  const touristPassword = await argon2.hash('Tourist@Vana2026', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const tourist = await prisma.user.upsert({
    where: { email: 'aditi@example.com' },
    update: {},
    create: {
      email: 'aditi@example.com',
      phone: '+919876543210',
      passwordHash: touristPassword,
      role: 'tourist',
      status: 'active',
    },
  });
  console.log(`  ✅ Tourist: ${tourist.email}`);

  // ─── Danger Zones (Meghalaya / Sikkim) ─────────────

  const livingRootBridge = await prisma.dangerZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Double Decker Living Root Bridge Trek',
      description: 'Steep, slippery trail with limited mobile coverage. Risk of falls during monsoon.',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[91.6800, 25.2800], [91.6900, 25.2800], [91.6900, 25.2900], [91.6800, 25.2900], [91.6800, 25.2800]]],
      }),
      riskTier: 'restricted',
      state: 'Meghalaya',
      active: true,
      createdById: admin.id,
      approvedById: admin.id,
    },
  });

  const dawkiRiver = await prisma.dangerZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Dawki River Crossing Zone',
      description: 'River crossing area near India-Bangladesh border. Strong currents during monsoon.',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[92.0100, 25.1800], [92.0300, 25.1800], [92.0300, 25.1950], [92.0100, 25.1950], [92.0100, 25.1800]]],
      }),
      riskTier: 'high_risk',
      state: 'Meghalaya',
      active: true,
      createdById: admin.id,
      approvedById: admin.id,
    },
  });

  const nathulaPas = await prisma.dangerZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Nathula Pass High Altitude Zone',
      description: 'High altitude (4,310m). Risk of altitude sickness. Restricted military area.',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[88.8300, 27.3700], [88.8600, 27.3700], [88.8600, 27.3900], [88.8300, 27.3900], [88.8300, 27.3700]]],
      }),
      riskTier: 'high_risk',
      state: 'Sikkim',
      active: true,
      createdById: admin.id,
      approvedById: admin.id,
    },
  });
  console.log(`  ✅ Danger Zones: 3 seeded (Meghalaya + Sikkim)`);

  // ─── Dead Zones (No/Low Network) ───────────────────

  await prisma.deadZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Nongriat Village Trail - No Signal Zone',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[91.6750, 25.2750], [91.6950, 25.2750], [91.6950, 25.2950], [91.6750, 25.2950], [91.6750, 25.2750]]],
      }),
      signalType: 'no_signal',
      state: 'Meghalaya',
      source: 'manual',
      active: true,
    },
  });

  await prisma.deadZone.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Gurudongmar Lake Approach - Low Signal',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[88.6800, 27.9500], [88.7200, 27.9500], [88.7200, 27.9800], [88.6800, 27.9800], [88.6800, 27.9500]]],
      }),
      signalType: 'low_signal',
      state: 'Sikkim',
      source: 'manual',
      active: true,
    },
  });
  console.log(`  ✅ Dead Zones: 2 seeded (NER no-signal areas)`);

  // ─── Authority Profile ─────────────────────────────

  await prisma.authorityProfile.upsert({
    where: { userId: authority.id },
    update: {},
    create: {
      userId: authority.id,
      department: 'Tourist Police, East Khasi Hills',
      jurisdictionZoneId: livingRootBridge.id,
      verifiedByAdminId: admin.id,
      verifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Authority Profile: Inspector linked to jurisdiction`);

  // ─── Demo Emergency Contacts ───────────────────────

  await prisma.emergencyContact.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      userId: tourist.id,
      name: 'Raj Sharma',
      phone: '+919876500001',
      email: 'raj.sharma@example.com',
      relationship: 'Father',
    },
  });

  await prisma.emergencyContact.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      userId: tourist.id,
      name: 'Priya Sharma',
      phone: '+919876500002',
      email: 'priya.sharma@example.com',
      relationship: 'Mother',
    },
  });
  console.log(`  ✅ Emergency Contacts: 2 seeded for tourist`);

  // ─── Demo Fares (NER) ─────────────────────────────

  const nerFares = [
    { destination: 'Shillong', category: 'taxi_per_km', value: 15, source: 'estimated' },
    { destination: 'Shillong', category: 'auto_per_km', value: 10, source: 'estimated' },
    { destination: 'Shillong', category: 'shared_sumo', value: 200, source: 'estimated' },
    { destination: 'Gangtok', category: 'taxi_per_km', value: 18, source: 'estimated' },
    { destination: 'Gangtok', category: 'shared_jeep', value: 250, source: 'estimated' },
    { destination: 'Cherrapunji', category: 'taxi_per_km', value: 16, source: 'estimated' },
  ];

  for (const fare of nerFares) {
    await prisma.faresCache.upsert({
      where: { destination_category: { destination: fare.destination, category: fare.category } },
      update: { value: fare.value },
      create: { ...fare, currency: 'INR', refreshedAt: new Date() },
    });
  }
  console.log(`  ✅ Fares: ${nerFares.length} NER fares seeded`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo credentials:');
  console.log('  Admin:     admin@vana.gov.in / Admin@Vana2026');
  console.log('  Authority: inspector@meghalaya.police.gov.in / Authority@Vana2026');
  console.log('  Tourist:   aditi@example.com / Tourist@Vana2026');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
