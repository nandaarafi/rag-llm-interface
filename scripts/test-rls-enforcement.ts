/**
 * Test if RLS policies are actually being enforced
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { chat } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function testRLSEnforcement() {
  console.log('🔍 Testing if RLS policies are actually enforced...\n');

  try {
    // Step 1: Create a very restrictive policy temporarily
    console.log('Creating a very restrictive test policy...');
    await db.execute(sql`
      DROP POLICY IF EXISTS "test_restrictive" ON "Chat";
      CREATE POLICY "test_restrictive" ON "Chat"
          FOR ALL
          USING (false);  -- This should block ALL access
    `);

    // Step 2: Try to query chats (should return 0 if RLS is working)
    console.log('Querying chats with restrictive policy...');
    const chats = await db.select().from(chat);
    console.log(`Result: Found ${chats.length} chats`);

    if (chats.length === 0) {
      console.log('✅ RLS is working! Policies are being enforced.');
    } else {
      console.log('❌ RLS is NOT working. Policies are being bypassed.');
      console.log('This might be because:');
      console.log('1. You are connecting as a superuser');
      console.log('2. RLS is not enabled properly');
      console.log('3. The database role bypasses RLS');
    }

    // Step 3: Restore the original policy
    console.log('\nRestoring original policies...');
    await db.execute(sql`
      DROP POLICY IF EXISTS "test_restrictive" ON "Chat";
      CREATE POLICY "users_own_chats" ON "Chat"
          FOR ALL
          USING ("userId" = current_user_id() AND current_user_id() IS NOT NULL);
      CREATE POLICY "public_chats_readable" ON "Chat"
          FOR SELECT
          USING (visibility = 'public');
    `);

    console.log('✅ Original policies restored');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.end();
  }
}

testRLSEnforcement();