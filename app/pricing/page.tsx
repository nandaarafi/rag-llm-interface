'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import apiClient from '@/lib/api';
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
const tiers = [
  {
    name: 'Hobby',
    price: { monthly: '$0', yearly: '$0' },
    description: 'Free',
    features: [
        "10 access requests to GPT-4o Mini.",
        "Limited agent requests.",
        "Limited tab completions.",
        "Pro two-week trial."
      ],    buttons: [
    ],
    proGlow: false,
  },
  {
    name: 'Pro',
    price: { monthly: '$20', yearly: '$16' },
    description: 'Everything in Hobby, plus',
    features: [
        "200 access requests to OpenAI GPT-4.1, Claude, etc.",
        "Extended limits on agent requests.",
        "Unlimited tab completions.",
        "Access to Background Agents.",
        "Access to Bug Bot.",
        "Access to maximum context windows."
    ],
    buttons: [
      { text: 'Get Pro', variant: 'default', onClick: () => handlePayment('818286') },
    ],
    proGlow: true,
  },
  {
    name: 'Ultra',
    price: { monthly: '$200', yearly: '$160' },
    description: 'Everything in Pro, plus',
    features: [
        "20x usage on all OpenAI, Claude, Gemini models.",
        "Priority access to new features.",
        "Unlimited access to all models."
    ],    buttons: [{ text: 'Get Ultra', variant: 'default', onClick: () => handlePayment('905815') }],
    proGlow: false,
  },
];



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
                'px-4 py-1 rounded-md',
                // MODIFIED: Replaced `bg-gray-600` with `bg-accent` for the active state
                billingCycle === 'monthly' ? 'bg-gray-200' : 'bg-transparent'
              )}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-1 rounded-md',
                // MODIFIED: Replaced `bg-gray-600` with `bg-accent` for the active state
                billingCycle === 'yearly' ? 'bg-gray-200' : 'bg-transparent'
              )}
            >
              YEARLY (SAVE 20%)
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-8">Individual Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div key={tier.name} className={cn('relative', tier.proGlow && 'p-[1px] rounded-2xl bg-gradient-to-b from-pink-500 via-purple-500 to-green-400')}>
                {/* MODIFIED: Removed `bg-gray-900` and `border-gray-800`.
                    The Card component now correctly uses `bg-card` and `border-border` from the theme. */}
                <Card className="rounded-2xl h-full flex flex-col">
                  <CardHeader>
                    {/* MODIFIED: Replaced `text-gray-400` with `text-muted-foreground` */}
                    <CardTitle className="text-muted-foreground font-normal">{tier.name}</CardTitle>
                    {tier.name === 'Hobby' ? (
                        <p className="text-4xl font-bold">Free</p>
                    ) : (
                        <p className="text-4xl font-bold">
                        {billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                        {/* MODIFIED: Replaced `text-gray-400` with `text-muted-foreground` */}
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                        </p>
                    )}
                  </CardHeader>
                  <CardContent className="grow">
                    {/* MODIFIED: Replaced `text-gray-400` with `text-muted-foreground` */}
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
                    {tier.buttons.map(button => (
                      // MODIFIED: Removed the entire conditional class override.
                      // This allows the Button's `variant` prop to correctly apply theme styles.
                      <Button key={button.text} variant={button.variant as any} className="w-full" onClick={button.onClick}>
                          {button.text}
                      </Button>
                    ))}
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