'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, MessageSquare, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Paywall() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);
    router.push('/pricing');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
          <CardDescription>
            You've reached the limit of your free plan. Upgrade to continue chatting with unlimited access.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-5 text-blue-500" />
              <span className="text-sm">Unlimited chat messages</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-yellow-500" />
              <span className="text-sm">Access to all AI models</span>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="size-5 text-purple-500" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleUpgrade} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Redirecting...' : 'Upgrade Now'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}