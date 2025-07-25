import { NextRequest, NextResponse } from 'next/server';
import { getEmailEnabled, getGoogleOAuthEnabled, getExternalServicesEnabled } from '@/lib/dev-config';
import { getSystemSetting } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const [emailEnabled, googleOAuthEnabled, externalServicesEnabled] = await Promise.all([
      getEmailEnabled(),
      getGoogleOAuthEnabled(),
      getExternalServicesEnabled(),
    ]);

    return NextResponse.json({
      emailEnabled,
      googleOAuthEnabled,
      externalServicesEnabled,
      // Also include raw individual settings for admin purposes
      rawSettings: {
        emailSetting: await getSystemSetting('ENABLE_EMAIL_SENDING'),
        oauthSetting: await getSystemSetting('ENABLE_GOOGLE_OAUTH'),
        masterSetting: await getSystemSetting('ENABLE_EXTERNAL_SERVICES'),
      }
    });
  } catch (error) {
    console.error('Failed to get system settings:', error);
    
    // Return defaults if database fails
    return NextResponse.json({
      emailEnabled: true,
      googleOAuthEnabled: true,
      externalServicesEnabled: true,
      rawSettings: {
        emailSetting: true,
        oauthSetting: true,
        masterSetting: true,
      }
    });
  }
}