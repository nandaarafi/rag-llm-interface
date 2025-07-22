'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, MessageSquare, Zap, Check } from 'lucide-react';
import apiClient from '@/lib/api';
import { getPurchasablePlans, getPlanConfig } from '@/lib/pricing-config';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('🎭 PaywallModal render:', { open });

  // Add global escape key listener for debugging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        console.log('🔑 Global Escape key detected when modal is open');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    console.log('🎭 PaywallModal handleOpenChange:', { newOpen, currentOpen: open });
    onOpenChange(newOpen);
  };

  const handlePayment = async (variantId: string) => {
    setIsLoading(true);
    try {
      const { url }: { url: string } = await apiClient.post('/create-checkout', {
        variantId,
        redirectUrl: window.location.origin,
      });
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const tiers = getPurchasablePlans();
  const proPlan = getPlanConfig('pro');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          console.log('🔑 Escape key pressed in PaywallModal');
          e.preventDefault();
          handleOpenChange(false);
        }}
        onPointerDownOutside={(e) => {
          console.log('👆 Click outside PaywallModal');
          handleOpenChange(false);
        }}
        onInteractOutside={(e) => {
          console.log('🔄 Interact outside PaywallModal');
          handleOpenChange(false);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="size-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">You&apos;ve reached your free limit</DialogTitle>
              <p className="text-muted-foreground text-sm">
                Upgrade to continue chatting with unlimited access
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Free Plan Benefits Summary */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 text-sm">What you get with {proPlan.displayName}:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-blue-500" />
              <span className="text-sm">{proPlan.features[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-yellow-500" />
              <span className="text-sm">{proPlan.features[2]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-purple-500" />
              <span className="text-sm">{proPlan.features[3]}</span>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-1 rounded-lg flex text-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-md transition-colors',
                billingCycle === 'monthly' 
                  ? 'bg-background shadow-sm' 
                  : 'hover:bg-muted-foreground/10'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-md transition-colors',
                billingCycle === 'yearly' 
                  ? 'bg-background shadow-sm' 
                  : 'hover:bg-muted-foreground/10'
              )}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative',
                tier.ui.proGlow && 'p-[1px] rounded-xl bg-gradient-to-b from-pink-500 via-purple-500 to-green-400'
              )}
            >
              <Card className="rounded-xl h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.displayName}</CardTitle>
                    {tier.ui.popular && (
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {billingCycle === 'monthly' ? tier.priceDisplay.monthly : tier.priceDisplay.yearly}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="grow">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePayment(tier.lemonsqueezy.variantId!)}
                    className="w-full"
                    disabled={isLoading}
                    variant={tier.ui.proGlow ? 'default' : 'outline'}
                  >
                    {isLoading ? 'Processing...' : tier.ui.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            You can cancel anytime. All plans include a 14-day money-back guarantee.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}