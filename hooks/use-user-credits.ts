'use client';

import { useState, useEffect } from 'react';

interface UserCreditsData {
  credits: number;
  planType: 'free' | 'pro' | 'ultra';
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserCredits(userId?: string): UserCreditsData {
  const [data, setData] = useState({
    credits: 0,
    planType: 'free' as const,
    loading: true,
    error: null as string | null,
  });

  const fetchUserCredits = async () => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false, error: 'No user ID provided' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/api/user/credits?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user credits');
      }
      
      const result = await response.json();
      
      setData({
        credits: result.credits,
        planType: result.planType,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, [userId]);

  return {
    ...data,
    refetch: fetchUserCredits,
  };
}