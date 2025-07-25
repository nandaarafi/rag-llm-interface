import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { 
  getAllSystemSettings, 
  updateSystemSetting,
} from '@/lib/db/queries';

// GET - Get all system settings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // For now, any authenticated user can view settings
    // In production, you'd want proper admin role checking
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getAllSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get system settings:', error);
    return NextResponse.json(
      { error: 'Failed to get system settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update system setting (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // For now, any authenticated user can update settings
    // In production, you'd want proper admin role checking
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, condition } = await request.json();

    if (!description || typeof condition !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid description or condition' },
        { status: 400 }
      );
    }

    await updateSystemSetting(description, condition);
    
    return NextResponse.json({ 
      success: true, 
      message: `Setting ${description} updated to ${condition}` 
    });
  } catch (error) {
    console.error('Failed to update system setting:', error);
    return NextResponse.json(
      { error: 'Failed to update system setting' },
      { status: 500 }
    );
  }
}