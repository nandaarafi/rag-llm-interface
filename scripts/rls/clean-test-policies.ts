/**
 * Clean up any test policies left over from debugging
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function cleanTestPolicies() {
  console.log('🧹 Cleaning up test policies...\n');

  try {
    // Remove any leftover test policies
    await db.execute(sql`DROP POLICY IF EXISTS "test_restrictive" ON "Chat"`);
    
    console.log('✅ Test policies cleaned up');

  } catch (error) {
    console.error('❌ Failed to clean test policies:', error);
  } finally {
    await client.end();
  }
}

cleanTestPolicies();