/**
 * Check if RLS is enabled on tables
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on tables...\n');

  try {
    const result = await db.execute(`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity,
        relname
      FROM pg_tables pt
      JOIN pg_class pc ON pc.relname = pt.tablename
      WHERE schemaname = 'public'
      AND tablename IN ('User', 'Chat', 'Message_v2', 'Document', 'SystemSettings')
      ORDER BY tablename;
    `);

    console.log('Table RLS Status:');
    console.log('================');
    
    for (const row of result) {
      const status = row.rowsecurity ? '✅ ENABLED' : '❌ DISABLED';
      console.log(`${row.tablename}: ${status}`);
    }

    // Check for RLS policies
    console.log('\n🔍 Checking RLS policies...\n');
    
    const policies = await db.execute(`
      SELECT 
        schemaname, 
        tablename, 
        policyname,
        cmd,
        qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    console.log('RLS Policies:');
    console.log('=============');
    
    for (const policy of policies) {
      console.log(`${policy.tablename}.${policy.policyname} (${policy.cmd})`);
    }

    if (policies.length === 0) {
      console.log('❌ No RLS policies found!');
    }

  } catch (error) {
    console.error('❌ Error checking RLS status:', error);
  } finally {
    await client.end();
  }
}

checkRLSStatus();