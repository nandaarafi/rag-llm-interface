'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'invalid'>('verifying');

  useEffect(() => {
    if (!token) {
      setVerificationStatus('invalid');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setVerificationStatus('success');
          toast({ type: 'success', description: 'Email verified successfully!' });
        } else {
          setVerificationStatus('error');
          toast({ type: 'error', description: 'Email verification failed!' });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        toast({ type: 'error', description: 'Email verification failed!' });
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-6 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          {verificationStatus === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <h3 className="text-xl font-semibold dark:text-zinc-50">Verifying Email</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Email Verified!</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
            </>
          )}
          
          {verificationStatus === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Verification Failed</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Your email verification link is invalid or has expired. Please try registering again.
              </p>
            </>
          )}
          
          {verificationStatus === 'invalid' && (
            <>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">Invalid Link</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                The verification link is missing or invalid.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 px-4 sm:px-16">
          {verificationStatus === 'success' && (
            <Link href="/login">
              <Button size="lg" className="w-full">
                Sign In Now
              </Button>
            </Link>
          )}
          
          {(verificationStatus === 'error' || verificationStatus === 'invalid') && (
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full">
                Register Again
              </Button>
            </Link>
          )}
          
          <Link href="/" className="text-center">
            <Button size="lg" variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl gap-6 flex flex-col">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <h3 className="text-xl font-semibold dark:text-zinc-50">Loading...</h3>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}