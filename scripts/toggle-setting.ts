#!/usr/bin/env tsx

/**
 * Toggle system settings via direct database access
 * Usage: npx tsx scripts/toggle-setting.ts ENABLE_EMAIL_SENDING false
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { systemSettings } from '../lib/db/schema';

async function toggleSetting() {
  const settingName = process.argv[2];
  const settingValue = process.argv[3] === 'true';

  if (!settingName || process.argv[3] === undefined) {
    console.log('Usage: npx tsx scripts/toggle-setting.ts <SETTING_NAME> <true|false>');
    console.log('');
    console.log('Available settings:');
    console.log('- ENABLE_EXTERNAL_SERVICES');
    console.log('- ENABLE_EMAIL_SENDING');  
    console.log('- ENABLE_GOOGLE_OAUTH');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx scripts/toggle-setting.ts ENABLE_EMAIL_SENDING false');
    console.log('  npx tsx scripts/toggle-setting.ts ENABLE_GOOGLE_OAUTH true');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  try {
    console.log(`🔧 Setting ${settingName} to ${settingValue}...`);

    const result = await db
      .update(systemSettings)
      .set({
        condition: settingValue,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.description, settingName))
      .returning();

    if (result.length === 0) {
      console.log(`❌ Setting ${settingName} not found. Creating it...`);
      await db.insert(systemSettings).values({
        description: settingName,
        condition: settingValue,
      });
      console.log(`✅ Created ${settingName} = ${settingValue}`);
    } else {
      console.log(`✅ Updated ${settingName} = ${settingValue}`);
    }

    // Show all current settings
    console.log('\n📊 Current settings:');
    const allSettings = await db.select().from(systemSettings);
    allSettings.forEach(setting => {
      console.log(`   ${setting.description}: ${setting.condition}`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Failed to toggle setting:', error);
    process.exit(1);
  }
}

toggleSetting().catch(console.error);