'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import apiClient from '@/lib/api';
import { getAllPlans, } from '@/lib/pricing-config';
  const handlePayment = async (variantId: string) => {
    // setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/create-checkout",
        {
          variantId,
          redirectUrl: window.location.origin,
        }
      );

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    // setIsLoading(false);
  };

  const tiers = getAllPlans();



export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
 
  return (
    // MODIFIED: Removed hardcoded `bg-black` and `text-white`. 
    // The global CSS applies `bg-background` and `text-foreground` to the body.
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Pricing</h1>
          {/* MODIFIED: Replaced `text-gray-400` with `text-muted-foreground` */}
          <p className="text-muted-foreground">Choose the plan that works for you</p>
        </header>

        <div className="flex justify-center items-center mb-12">
          {/* MODIFIED: Replaced `bg-gray-800` with `bg-muted` for theme consistency */}
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

        <section>
          <h2 className="text-2xl font-semibold mb-8">Individual Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div key={tier.id} className={cn('relative', tier.ui.proGlow && 'p-[1px] rounded-2xl bg-gradient-to-b from-pink-500 via-purple-500 to-green-400')}>
                <Card className="rounded-2xl h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-muted-foreground font-normal">{tier.displayName}</CardTitle>
                      {tier.ui.popular && (
                        <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    {tier.id === 'free' ? (
                        <p className="text-4xl font-bold">{tier.priceDisplay.monthly}</p>
                    ) : (
                        <p className="text-4xl font-bold">
                        {billingCycle === 'monthly' ? tier.priceDisplay.monthly : tier.priceDisplay.yearly}
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                        </p>
                    )}
                  </CardHeader>
                  <CardContent className="grow">
                    <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {tier.lemonsqueezy.variantId ? (
                      <Button 
                        variant={tier.ui.buttonVariant as any} 
                        className="w-full" 
                        onClick={() => handlePayment(tier.lemonsqueezy.variantId!)}
                      >
                        {tier.ui.buttonText}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled
                      >
                        Current Plan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}