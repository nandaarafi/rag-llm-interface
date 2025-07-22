'use server';

import { z } from 'zod';

import { getUser, createUserWithEmailVerification } from '@/lib/db/queries';
import { sendEmailVerificationEmail } from '@/lib/resend';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data' | 'oauth_only' | 'email_not_verified';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Check if user exists and is OAuth-only before attempting sign in
    const users = await getUser(validatedData.email);
    if (users.length > 0) {
      const user = users[0];
      if (!user.password) {
        return { status: 'oauth_only' };
      }
      if (!user.emailVerified) {
        return { status: 'email_not_verified' };
      }
    }

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data'
    | 'verification_sent';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    
    // Create user with email verification token
    const verificationToken = await createUserWithEmailVerification(
      validatedData.email, 
      validatedData.password
    );
    
    // Send verification email (non-blocking)
    try {
      await sendEmailVerificationEmail(validatedData.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    return { status: 'verification_sent' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
