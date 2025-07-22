'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to root immediately when component mounts
    router.replace('/');
  }, [router]);

  // Return null since we're redirecting immediately
  return null;
}