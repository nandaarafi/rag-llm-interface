/**
 * Debug chat visibility and ownership
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { chat } from '@/lib/db/schema';

config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function debugChats() {
  console.log('🔍 Debugging chat data...\n');

  try {
    const allChats = await db.select().from(chat);
    
    console.log(`Found ${allChats.length} total chats:`);
    console.log('=====================================');
    
    for (const chatItem of allChats) {
      console.log(`ID: ${chatItem.id}`);
      console.log(`Title: ${chatItem.title}`);
      console.log(`UserID: ${chatItem.userId}`);
      console.log(`Visibility: ${chatItem.visibility}`);
      console.log(`Created: ${chatItem.createdAt}`);
      console.log('---');
    }

    const publicChats = allChats.filter(c => c.visibility === 'public');
    const privateChats = allChats.filter(c => c.visibility === 'private');
    
    console.log(`\nSummary:`);
    console.log(`Public chats: ${publicChats.length}`);
    console.log(`Private chats: ${privateChats.length}`);

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await client.end();
  }
}

debugChats();