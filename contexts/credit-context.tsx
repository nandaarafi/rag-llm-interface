'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPlanConfig, type PlanType } from '@/lib/pricing-config';

interface CreditContextType {
  credits: number;
  planType: PlanType;
  loading: boolean;
  error: string | null;
  refetchCredits: () => Promise<void>;
  decrementCredit: () => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId?: string;
}) {
  const [credits, setCredits] = useState(getPlanConfig('free').credits); // Start with free plan default from config
  const [planType, setPlanType] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchCredits = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError('No user ID provided');
      return;
    }

    try {
      // setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/credits?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user credits');
      }
      
      const result = await response.json();
      
      setCredits(result.credits);
      setPlanType(result.planType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const decrementCredit = useCallback(() => {
    setCredits(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    refetchCredits();
  }, [refetchCredits]);

  return (
    <CreditContext.Provider
      value={{
        credits,
        planType,
        loading,
        error,
        refetchCredits,
        decrementCredit,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}