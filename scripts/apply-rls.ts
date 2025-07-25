/**
 * Apply RLS policies manually
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'node:fs';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function applyRLS() {
  console.log('🔧 Applying RLS policies...\n');

  try {
    // Read and execute the fixed RLS policies SQL
    const rlsSQL = readFileSync('lib/db/migrations/0015_rls_fixed.sql', 'utf8');

    console.log('Applying fixed RLS policies...');
    await db.execute(rlsSQL);
    console.log('✅ Fixed RLS policies applied');

    console.log('\n🎉 RLS setup completed successfully!');

  } catch (error) {
    console.error('❌ Error applying RLS:', error);
  } finally {
    await client.end();
  }
}

applyRLS();