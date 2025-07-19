'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('Invalid reset link. Please request a new password reset.');
        setIsValidToken(false);
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/reset-password?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setIsValidToken(true);
        } else {
          setMessage(data.message);
          setIsValidToken(false);
        }
      } catch (error) {
        setMessage('An error occurred while verifying the reset link.');
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsSuccess(false);
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      
      setMessage(data.message);
      setIsSuccess(data.success);
      
      if (data.success) {
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-gray-500">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">
              Invalid Reset Link
            </h3>
          </div>
          
          <Card className="flex flex-col gap-4 px-4 py-8 sm:px-16">
            <div className="text-sm p-3 rounded bg-red-50 text-red-800 border border-red-200">
              {message}
            </div>
            
            <div className="flex flex-col gap-2 text-center text-sm">
              <Link 
                href="/forgot-password" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Request a new password reset
              </Link>
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Back to login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Reset Password
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter your new password below.
          </p>
        </div>
        
        <Card className="flex flex-col gap-4 px-4 py-8 sm:px-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <Button type="submit" disabled={isLoading || !password || !confirmPassword}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          {message && (
            <div className={`text-sm p-3 rounded ${
              isSuccess 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
              {isSuccess && <p className="mt-2">Redirecting to login page...</p>}
            </div>
          )}

          <div className="flex flex-col gap-2 text-center text-sm">
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}