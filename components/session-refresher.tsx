'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Listen for payment success events
    const handlePaymentSuccess = () => {
      // Force a full page refresh to get updated session
      window.location.reload();
    };

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payment-success') {
        handlePaymentSuccess();
        localStorage.removeItem('payment-success');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component mount
    if (localStorage.getItem('payment-success')) {
      handlePaymentSuccess();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return null; // This component doesn't render anything
}