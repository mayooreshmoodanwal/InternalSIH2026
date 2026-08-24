import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function verifyNeon() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL database...');
  const sql = neon(databaseUrl);
  const result = await sql`SELECT 1 as connected, NOW() as current_time, version() as pg_version;`;
  console.log('✅ Successfully connected to Neon Database!');
  console.log('Query result:', result);
}

verifyNeon().catch((err) => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
