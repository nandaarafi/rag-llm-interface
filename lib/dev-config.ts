import 'server-only';
import { getSystemSetting } from '@/lib/db/queries';

// Database-driven system settings
export async function getExternalServicesEnabled(): Promise<boolean> {
  try {
    return await getSystemSetting('ENABLE_EXTERNAL_SERVICES');
  } catch (error) {
    console.error('Failed to get external services setting, defaulting to true:', error);
    return true; // Default to enabled if database fails
  }
}

export async function getEmailEnabled(): Promise<boolean> {
  try {
    // Check master switch first
    const externalServicesEnabled = await getSystemSetting('ENABLE_EXTERNAL_SERVICES');
    if (!externalServicesEnabled) {
      return false; // Master switch overrides individual setting
    }
    
    // If master switch is on, check individual setting
    return await getSystemSetting('ENABLE_EMAIL_SENDING');
  } catch (error) {
    console.error('Failed to get email setting, defaulting to true:', error);
    return true;
  }
}

export async function getGoogleOAuthEnabled(): Promise<boolean> {
  try {
    // Check master switch first
    const externalServicesEnabled = await getSystemSetting('ENABLE_EXTERNAL_SERVICES');
    if (!externalServicesEnabled) {
      return false; // Master switch overrides individual setting
    }
    
    // If master switch is on, check individual setting
    return await getSystemSetting('ENABLE_GOOGLE_OAUTH');
  } catch (error) {
    console.error('Failed to get Google OAuth setting, defaulting to true:', error);
    return true;
  }
}

// Legacy constant for backward compatibility (deprecated)
export const DEV_ENABLE_EXTERNAL_SERVICES = true;