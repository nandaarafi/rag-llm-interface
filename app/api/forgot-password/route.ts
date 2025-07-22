import { type NextRequest, NextResponse } from 'next/server';
import { getUser, createPasswordResetToken } from '@/lib/db/queries';
import { sendPasswordResetEmail } from '@/lib/resend';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const users = await getUser(email);
    
    // Always return success to prevent email enumeration attacks
    if (users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists, you will receive a password reset link.' 
      });
    }

    const user = users[0];
    
    // Don't allow password reset for OAuth-only users
    if (!user.password) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = await createPasswordResetToken(email);
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with this email exists, you will receive a password reset link.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}