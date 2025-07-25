/**
 * Update admin email in RLS policies for production
 * Usage: ADMIN_EMAIL=admin@yourprod.com npx tsx scripts/update-admin-email.ts
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function updateAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL || 'nandarafi80@gmail.com';
  
  console.log(`🔧 Updating admin email to: ${adminEmail}\n`);

  try {
    // Update the is_admin function with the new email
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION is_admin()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      AS $$
        SELECT EXISTS(
          SELECT 1 FROM "User" 
          WHERE id = current_user_id() 
          AND email = ${adminEmail}
        );
      $$;
    `);

    console.log('✅ Admin email updated successfully!');
    console.log(`Admin access is now restricted to: ${adminEmail}`);

  } catch (error) {
    console.error('❌ Failed to update admin email:', error);
  } finally {
    await client.end();
  }
}

updateAdminEmail();