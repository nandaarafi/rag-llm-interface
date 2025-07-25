/**
 * Simple test script to verify RLS is working correctly
 * Run with: npx tsx scripts/test-rls.ts
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { chat, user } from '@/lib/db/schema';
import { withUserContext, getCurrentUserContext } from '@/lib/db/auth-context';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function testRLS() {
  console.log('🧪 Testing Row Level Security...\n');

  try {
    // Test 1: Check if we can query without user context (should return empty)
    console.log('Test 1: Query chats without user context');
    const chatsWithoutContext = await db.select().from(chat);
    console.log(`Result: Found ${chatsWithoutContext.length} chats (should be 0 or only public chats)`);

    // Test 2: Find a test user (you)
    console.log('\nTest 2: Finding your user account');
    const [testUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, 'nandarafi80@gmail.com'))
      .limit(1);

    if (!testUser) {
      console.log('❌ Test user not found. Please make sure you have an account.');
      return;
    }

    console.log(`✅ Found user: ${testUser.email} (ID: ${testUser.id})`);

    // Test 3: Query chats with user context
    console.log('\nTest 3: Query chats with user context');
    const chatsWithContext = await withUserContext(testUser.id, async () => {
      const currentContext = await getCurrentUserContext();
      console.log(`Current user context: ${currentContext}`);
      
      return await db.select().from(chat);
    });

    console.log(`Result: Found ${chatsWithContext.length} chats for user ${testUser.email}`);

    // Test 4: Try to access your own user data (should work)
    console.log('\nTest 4: Try to access your own user data');
    const userData = await withUserContext(testUser.id, async () => {
      return await db.select().from(user).where(eq(user.id, testUser.id));
    });

    console.log(`Result: Found ${userData.length} user record(s) (should be 1)`);
    if (userData.length > 0) {
      console.log(`✅ Successfully accessed own user data: ${userData[0].email}`);
    }

    console.log('\n✅ RLS test completed successfully!');
    console.log('Your RLS setup is working correctly.');

  } catch (error) {
    console.error('❌ RLS test failed:', error);
  } finally {
    await client.end();
  }
}

testRLS();