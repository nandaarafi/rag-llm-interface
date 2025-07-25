/**
 * Complete production deployment script for RLS
 * Usage: ADMIN_EMAIL=admin@yourcompany.com npx tsx scripts/deploy-production.ts
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { chat, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function deployProduction() {
  const adminEmail = process.env.ADMIN_EMAIL || 'nandarafi80@gmail.com';
  
  console.log('🚀 Deploying RLS to Production...\n');
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'local'}\n`);

  try {
    // Step 1: Clean up any test policies
    console.log('1. Cleaning up test policies...');
    await db.execute(sql`DROP POLICY IF EXISTS "test_restrictive" ON "Chat"`);
    console.log('✅ Test policies cleaned');

    // Step 2: Update admin email
    console.log('2. Setting admin email...');
    await db.execute(`
      CREATE OR REPLACE FUNCTION is_admin()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      AS $$
        SELECT EXISTS(
          SELECT 1 FROM "User" 
          WHERE id = current_user_id() 
          AND email = '${adminEmail}'
        );
      $$;
    `);
    console.log(`✅ Admin email set to: ${adminEmail}`);

    // Step 3: Verify RLS status
    console.log('3. Verifying RLS status...');
    const rlsStatus = await db.execute(sql`
      SELECT 
        tablename, 
        rowsecurity
      FROM pg_tables pt
      JOIN pg_class pc ON pc.relname = pt.tablename
      WHERE schemaname = 'public'
      AND tablename IN ('User', 'Chat', 'Message_v2', 'Document', 'SystemSettings')
      ORDER BY tablename;
    `);

    console.log('RLS Status:');
    for (const table of rlsStatus) {
      const status = table.rowsecurity ? '✅' : '❌';
      console.log(`  ${table.tablename}: ${status}`);
    }

    // Step 4: Test basic functionality
    console.log('4. Testing basic functionality...');
    
    // Find an admin user to test with
    const [adminUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1);

    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}`);
      
      // Test user context
      await db.execute(sql`SELECT set_current_user_id(${adminUser.id}::uuid)`);
      const chats = await db.select().from(chat);
      console.log(`✅ User context test: Found ${chats.length} chats`);
      
      // Clear context
      await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
    } else {
      console.log(`⚠️  Admin user not found for email: ${adminEmail}`);
      console.log('   Create an account with this email to enable admin features');
    }

    console.log('\n🎉 Production deployment completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test your application thoroughly in production');
    console.log('2. Monitor logs for any RLS-related errors');
    console.log('3. Verify admin features are working correctly');
    
    if (!adminUser) {
      console.log(`4. Create an account with email: ${adminEmail} for admin access`);
    }

  } catch (error) {
    console.error('❌ Production deployment failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

deployProduction().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});