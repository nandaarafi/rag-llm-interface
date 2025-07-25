#!/usr/bin/env tsx

/**
 * Initialize default system settings in the database
 * Run this script after deploying the new SystemSettings table
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { systemSettings } from '../lib/db/schema';

async function initSystemSettings() {
  console.log('🔧 Initializing system settings...');

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  try {
    // Initialize default settings
    const defaultSettings = [
      {
        description: 'ENABLE_EXTERNAL_SERVICES',
        condition: true,
      },
      {
        description: 'ENABLE_EMAIL_SENDING',
        condition: true,
      },
      {
        description: 'ENABLE_GOOGLE_OAUTH',
        condition: true,
      },
    ];

    for (const setting of defaultSettings) {
      try {
        await db.insert(systemSettings).values({
          description: setting.description,
          condition: setting.condition,
        });
        console.log(`✅ Created setting: ${setting.description} = ${setting.condition}`);
      } catch (error) {
        // Setting might already exist, which is fine
        console.log(`ℹ️  Setting ${setting.description} already exists or failed to create`);
      }
    }

    console.log('🎉 System settings initialization completed!');
    console.log('\n📖 Usage:');
    console.log('- To disable email sending: Update ENABLE_EMAIL_SENDING to false');
    console.log('- To disable Google OAuth: Update ENABLE_GOOGLE_OAUTH to false');
    console.log('- To disable all external services: Update ENABLE_EXTERNAL_SERVICES to false');
    
  } catch (error) {
    console.error('❌ Failed to initialize system settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initSystemSettings().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});