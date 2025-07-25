/**
 * Simple RLS test using same connection
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { chat, user } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function testRLS() {
  console.log('🧪 Testing RLS with simple queries...\n');

  try {
    // Test 1: Find your user
    console.log('Test 1: Finding your user account');
    const [testUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, 'nandarafi80@gmail.com'))
      .limit(1);

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    console.log(`✅ Found user: ${testUser.email} (ID: ${testUser.id})`);

    // Test 2: Query chats without user context
    console.log('\nTest 2: Query chats without user context');
    const chatsWithoutContext = await db.select().from(chat);
    console.log(`Result: Found ${chatsWithoutContext.length} chats`);

    // Test 3: Set user context and query again
    console.log('\nTest 3: Set user context and query chats');
    await db.execute(sql`SELECT set_current_user_id(${testUser.id}::uuid)`);
    
    const chatsWithContext = await db.select().from(chat);
    console.log(`Result: Found ${chatsWithContext.length} chats for user ${testUser.email}`);

    // Test 4: Check current user context
    console.log('\nTest 4: Check current user context');
    const currentContext = await db.execute(sql`SELECT current_user_id() as user_id`);
    console.log(`Current context: ${currentContext[0]?.user_id}`);

    // Test 5: Clear context and query again
    console.log('\nTest 5: Clear context and query chats');
    await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
    
    const chatsAfterClear = await db.select().from(chat);
    console.log(`Result: Found ${chatsAfterClear.length} chats after clearing context`);

    console.log('\n✅ RLS test completed!');

  } catch (error) {
    console.error('❌ RLS test failed:', error);
  } finally {
    await client.end();
  }
}

testRLS();